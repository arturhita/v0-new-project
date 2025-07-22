"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"
import type { OperatorProfile } from "@/types/database"

const safeParseFloat = (value: any): number => {
  if (value === null || value === undefined || String(value).trim() === "") return 0
  const num = Number.parseFloat(String(value))
  return isNaN(num) ? 0 : num
}

export type AvailabilitySlot = {
  start: string
  end: string
}

export type DayAvailability = {
  enabled: boolean
  slots: AvailabilitySlot[]
}

export type Availability = {
  [key: string]: DayAvailability
}

const RegisterOperatorSchema = z
  .object({
    name: z.string().min(1, "Il nome è obbligatorio."),
    surname: z.string().min(1, "Il cognome è obbligatorio."),
    email: z.string().email("Email non valida."),
    password: z.string().min(8, "La password deve essere di almeno 8 caratteri."),
    confirmPassword: z.string(),
    stageName: z.string().min(3, "Il nome d'arte deve essere di almeno 3 caratteri."),
    bio: z.string().optional(),
    categories: z.string().min(1, "Seleziona almeno una categoria."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Le password non coincidono.",
    path: ["confirmPassword"],
  })

export async function registerOperator(formData: FormData) {
  const rawFormData = {
    name: formData.get("name"),
    surname: formData.get("surname"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    stageName: formData.get("stageName"),
    bio: formData.get("bio"),
    categories: formData.get("categories"),
  }

  const validatedFields = RegisterOperatorSchema.safeParse(rawFormData)

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Dati non validi. Controlla i campi.",
    }
  }

  const { email, password, name, surname, stageName, bio, categories } = validatedFields.data
  const fullName = `${name} ${surname}`.trim()
  const supabase = createAdminClient()

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      role: "operator",
    },
  })

  if (authError) {
    console.error("Error creating operator auth user:", authError)
    if (authError.message.includes("User already exists")) {
      return {
        success: false,
        message: "Un utente con questa email esiste già.",
        errors: { email: ["Email già in uso."] },
      }
    }
    return { success: false, message: authError.message }
  }

  if (!authData.user) {
    return { success: false, message: "Impossibile creare l'utente operatore." }
  }

  const userId = authData.user.id

  const { error: profileError } = await supabase.from("profiles").insert({
    id: userId,
    full_name: fullName,
    stage_name: stageName,
    bio: bio,
    categories: categories.split(","),
    role: "operator",
    status: "approved",
  })

  if (profileError) {
    console.error("Error creating operator profile:", profileError)
    await supabase.auth.admin.deleteUser(userId)
    return { success: false, message: profileError.message }
  }

  return { success: true, message: "Registrazione completata con successo!" }
}

const OperatorSchema = z.object({
  email: z.string().email({ message: "Email non valida." }),
  password: z.string().min(8, { message: "La password deve essere di almeno 8 caratteri." }),
  fullName: z.string().min(3, { message: "Il nome completo è obbligatorio." }),
  stageName: z.string().min(3, { message: "Il nome d'arte è obbligatorio." }),
})

export async function createOperator(formData: FormData) {
  const validatedFields = OperatorSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    fullName: formData.get("fullName"),
    stageName: formData.get("stageName"),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Campi mancanti. Impossibile creare l'operatore.",
    }
  }

  const { email, password, fullName, stageName } = validatedFields.data
  const supabase = createAdminClient()

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      role: "operator",
    },
  })

  if (authError) {
    console.error("Error creating operator auth user:", authError)
    return { message: authError.message }
  }

  if (!authData.user) {
    return { message: "Impossibile creare l'utente operatore." }
  }

  const userId = authData.user.id

  const { error: profileError } = await supabase.from("profiles").insert({
    id: userId,
    full_name: fullName,
    stage_name: stageName,
    role: "operator",
    status: "approved",
  })

  if (profileError) {
    console.error("Error creating operator profile:", profileError)
    await supabase.auth.admin.deleteUser(userId)
    return { message: profileError.message }
  }

  revalidatePath("/admin/operators")
  redirect("/admin/operators")
}

export async function updateOperatorCommission(operatorId: string, commission: string) {
  const supabase = createClient()
  try {
    const { error } = await supabase
      .from("profiles")
      .update({ commission_rate: safeParseFloat(commission) })
      .eq("id", operatorId)

    if (error) throw error

    revalidatePath("/admin/operators")
    revalidatePath(`/admin/operators/${operatorId}/edit`)

    return {
      success: true,
      message: "Commissione aggiornata con successo!",
    }
  } catch (error: any) {
    console.error("Errore aggiornamento commissione:", error)
    return {
      success: false,
      message: error.message || "Errore nell'aggiornamento della commissione",
    }
  }
}

export async function getOperatorPublicProfile(username: string) {
  const supabase = createClient()
  const { data: profiles, error: rpcError } = await supabase.rpc("get_public_profile_by_stage_name", {
    stage_name_to_find: username,
  })

  if (rpcError) {
    console.error(`Errore RPC durante la ricerca del profilo per "${username}":`, rpcError.message)
    return null
  }

  if (!profiles || profiles.length === 0) {
    console.log(`Profilo per "${username}" non trovato tramite RPC.`)
    return null
  }

  const profile = profiles[0]
  const services = profile.services as any
  const chatService = services?.chat
  const callService = services?.call
  const emailService = services?.email

  return {
    id: profile.id,
    full_name: profile.full_name,
    stage_name: profile.stage_name,
    avatar_url: profile.avatar_url,
    bio: profile.bio,
    specialization: profile.specialties || [],
    tags: profile.categories || [],
    rating: profile.average_rating,
    reviews_count: profile.reviews_count,
    is_online: profile.is_online,
    availability: profile.availability as Availability | null,
    services: [
      chatService?.enabled && { service_type: "chat", price: chatService.price_per_minute },
      callService?.enabled && { service_type: "call", price: callService.price_per_minute },
      emailService?.enabled && { service_type: "written", price: emailService.price },
    ].filter((service): service is { service_type: string; price: number } => service !== null && service !== false),
    reviews: [],
  }
}

export async function getAllOperators() {
  const supabase = createClient()
  const { data, error } = await supabase.from("profiles").select("*").eq("role", "operator")
  if (error) {
    console.error("Error fetching operators:", error)
    return []
  }
  return data
}

export async function getOperatorById(id: string) {
  const supabase = createClient()
  const { data, error } = await supabase.from("profiles").select("*").eq("id", id).single()
  if (error) {
    console.error(`Error fetching operator ${id}:`, error)
    return null
  }
  return data
}

export async function updateOperatorProfile(userId: string, profileData: Partial<OperatorProfile>) {
  const supabase = createClient()
  const { data, error } = await supabase.from("profiles").update(profileData).eq("id", userId).select().single()

  if (error) {
    console.error("Error updating operator profile:", error)
    return { error: "Impossibile aggiornare il profilo." }
  }

  if (data.stage_name) {
    revalidatePath(`/operator/${data.stage_name}`)
  }
  revalidatePath("/(platform)/dashboard/operator/profile")

  return { data }
}

export async function updateOperatorAvailability(userId: string, availability: any) {
  const supabase = createClient()
  const { data, error } = await supabase.from("profiles").update({ availability }).eq("id", userId).select().single()

  if (error) {
    console.error("Error updating availability:", error)
    return { error: "Impossibile aggiornare la disponibilità." }
  }

  if (data.stage_name) {
    revalidatePath(`/operator/${data.stage_name}`)
  }
  revalidatePath("/(platform)/dashboard/operator/availability")

  return { data }
}

export async function getOperatorProfiles(): Promise<OperatorProfile[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase.from("profiles").select("*").eq("role", "operator")

  if (error) {
    console.error("Error fetching operator profiles:", error)
    return []
  }
  return data as OperatorProfile[]
}

export async function getOperatorForAdmin(operatorId: string) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", operatorId)
    .eq("role", "operator")
    .single()

  if (error) {
    console.error("Error fetching operator for admin:", error)
    return null
  }
  return data
}

export async function updateOperatorDetails(prevState: any, formData: FormData) {
  const operatorId = formData.get("operatorId") as string
  if (!operatorId) return { message: "ID Operatore mancante.", error: true }

  const supabase = createAdminClient()

  const { error } = await supabase
    .from("profiles")
    .update({
      stage_name: formData.get("name") as string,
      // email cannot be updated here directly, it's an auth property
      phone: formData.get("phone") as string,
      specialties: [formData.get("discipline") as string],
      bio: formData.get("description") as string,
      status: formData.get("isActive") === "on" ? "Attivo" : "Sospeso",
    })
    .eq("id", operatorId)

  if (error) {
    console.error("Error updating operator details:", error)
    return { message: "Errore nell'aggiornamento dei dati.", error: true }
  }

  revalidatePath(`/admin/operators/${operatorId}/edit`)
  revalidatePath("/admin/operators")
  return { message: "Dati operatore aggiornati con successo.", error: false }
}
