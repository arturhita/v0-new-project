"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { unstable_noStore as noStore } from "next/cache"
import { z } from "zod"
import type { OperatorProfile } from "@/types/database"

// Funzione di supporto per convertire in modo sicuro le stringhe in numeri.
const safeParseFloat = (value: any): number => {
  if (value === null || value === undefined || String(value).trim() === "") return 0
  const num = Number.parseFloat(String(value))
  return isNaN(num) ? 0 : num
}

// Define Availability types
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

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
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

  const { error: profileError } = await supabaseAdmin.from("profiles").insert({
    id: userId,
    full_name: fullName,
    stage_name: stageName,
    bio: bio,
    categories: categories.split(","),
    role: "operator",
    status: "approved", // Profilo subito attivo come da descrizione pagina
  })

  if (profileError) {
    console.error("Error creating operator profile:", profileError)
    // Rollback auth user creation
    await supabaseAdmin.auth.admin.deleteUser(userId)
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

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
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

  const { error: profileError } = await supabaseAdmin.from("profiles").insert({
    id: userId,
    full_name: fullName,
    stage_name: stageName,
    role: "operator",
    status: "approved",
  })

  if (profileError) {
    console.error("Error creating operator profile:", profileError)
    // Rollback auth user creation
    await supabaseAdmin.auth.admin.deleteUser(userId)
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
  noStore()
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

  if (profiles.length > 1) {
    console.warn(`Trovati profili multipli per il nome d'arte "${username}". Viene usato il primo risultato.`)
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
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, full_name, stage_name, email, phone, bio, specialties, categories, status, commission_rate, created_at, avatar_url, services",
    )
    .eq("id", id)
    .single()
  if (error) {
    console.error(`Error fetching operator ${id}:`, error)
    return null
  }
  const { data: authData } = await supabaseAdmin.auth.admin.getUserById(id)
  if (data && authData.user) {
    data.email = authData.user.email
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
  const { data, error } = await supabaseAdmin.from("profiles").select("*").eq("role", "operator")

  if (error) {
    console.error("Error fetching operator profiles:", error)
    return []
  }
  return data as OperatorProfile[]
}

// Schema Zod per validare la struttura dei servizi inviata dal client.
const servicesSchema = z.object({
  chat: z.object({
    enabled: z.boolean(),
    price_per_minute: z.number().min(0),
  }),
  call: z.object({
    enabled: z.boolean(),
    price_per_minute: z.number().min(0),
  }),
  video: z.object({
    enabled: z.boolean(),
    price_per_minute: z.number().min(0),
  }),
})

// Server Action per aggiornare i servizi dell'operatore.
export async function updateOperatorServices(
  profileId: string,
  services: z.infer<typeof servicesSchema>,
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()

  const validatedServices = servicesSchema.safeParse(services)
  if (!validatedServices.success) {
    return { success: false, error: "Dati dei servizi non validi." }
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== profileId) {
    return { success: false, error: "Non autorizzato." }
  }

  const { error } = await supabase
    .from("profiles")
    .update({ services: validatedServices.data })
    .eq("id", profileId)

  if (error) {
    console.error("Errore durante l'aggiornamento dei servizi:", error)
    return { success: false, error: "Impossibile aggiornare i servizi nel database." }
  }

  revalidatePath("/(platform)/dashboard/operator/services")
  return { success: true }
}
