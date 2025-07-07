"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { createSupabaseAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import type { Profile } from "@/contexts/auth-context"

// Schema di validazione per i dati del form
const OperatorSchema = z.object({
  email: z.string().email({ message: "Inserisci un indirizzo email valido." }),
  password: z.string().min(8, { message: "La password deve essere di almeno 8 caratteri." }),
  fullName: z.string().min(3, { message: "Il nome completo è obbligatorio." }),
  stageName: z.string().min(3, { message: "Il nome d'arte è obbligatorio." }),
  phone: z.string().optional(),
  bio: z.string().optional(),
  commission: z.coerce.number().min(0).max(100).default(15),
  status: z.enum(["Attivo", "In Attesa", "Sospeso"]),
  isOnline: z.preprocess((val) => val === "on", z.boolean()),
  categories: z.string().array().min(1, { message: "Seleziona almeno una categoria." }),
  avatarUrl: z.string().optional(), // Per il data URL dell'avatar
})

export type OperatorState = {
  errors?: {
    email?: string[]
    password?: string[]
    fullName?: string[]
    stageName?: string[]
    categories?: string[]
    server?: string[]
  }
  message?: string | null
  success?: boolean
}

async function uploadAvatarFromDataUrl(dataUrl: string, userId: string) {
  if (!dataUrl || !dataUrl.startsWith("data:image")) {
    return null
  }
  const supabaseAdmin = createSupabaseAdminClient()
  const mimeType = dataUrl.match(/data:(.*);/)?.[1]
  const extension = mimeType?.split("/")[1] || "png"
  const filePath = `public/${userId}/avatar.${new Date().getTime()}.${extension}`
  const base64Str = dataUrl.replace(/^data:image\/\w+;base64,/, "")
  const fileBuffer = Buffer.from(base64Str, "base64")

  const { error: uploadError } = await supabaseAdmin.storage.from("avatars").upload(filePath, fileBuffer, {
    contentType: mimeType,
    upsert: true, // Usiamo upsert per sovrascrivere eventuali vecchi tentativi
  })

  if (uploadError) {
    console.error("Avatar upload failed:", uploadError.message)
    // Non blocchiamo la creazione per un avatar fallito, ma logghiamo l'errore
    return null
  }

  const {
    data: { publicUrl },
  } = supabaseAdmin.storage.from("avatars").getPublicUrl(filePath)
  return publicUrl
}

export async function createOperator(prevState: OperatorState, formData: FormData): Promise<OperatorState> {
  const validatedFields = OperatorSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    fullName: formData.get("fullName"),
    stageName: formData.get("stageName"),
    phone: formData.get("phone"),
    bio: formData.get("bio"),
    commission: formData.get("commission"),
    status: formData.get("status"),
    isOnline: formData.get("isOnline"),
    categories: formData.getAll("categories"),
    avatarUrl: formData.get("avatarUrl"),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Errore di validazione. Controlla i campi obbligatori.",
      success: false,
    }
  }

  const { email, password, fullName, stageName, avatarUrl, ...details } = validatedFields.data
  const supabaseAdmin = createSupabaseAdminClient()

  let newUserId: string | null = null

  try {
    // 1. Creazione dell'utente in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: "operator", full_name: fullName, stage_name: stageName },
    })

    if (authError) {
      if (authError.message.includes("User already registered")) {
        return {
          errors: { email: ["Questo indirizzo email è già registrato."] },
          success: false,
          message: "Email già in uso.",
        }
      }
      throw new Error(`Errore Auth: ${authError.message}`)
    }
    newUserId = authData.user.id

    // 2. Upload dell'avatar (se presente)
    const publicAvatarUrl = await uploadAvatarFromDataUrl(avatarUrl || "", newUserId)

    // 3. Estrazione dati complessi dal FormData
    const specialties = formData.getAll("specialties") as string[]
    const services = {
      chatEnabled: formData.get("service.chat.enabled") === "on",
      chatPrice: Number(formData.get("service.chat.price") || "0"),
      callEnabled: formData.get("service.call.enabled") === "on",
      callPrice: Number(formData.get("service.call.price") || "0"),
      emailEnabled: formData.get("service.email.enabled") === "on",
      emailPrice: Number(formData.get("service.email.price") || "0"),
    }
    const availability = {
      monday: formData.getAll("availability.monday") as string[],
      tuesday: formData.getAll("availability.tuesday") as string[],
      wednesday: formData.getAll("availability.wednesday") as string[],
      thursday: formData.getAll("availability.thursday") as string[],
      friday: formData.getAll("availability.friday") as string[],
      saturday: formData.getAll("availability.saturday") as string[],
      sunday: formData.getAll("availability.sunday") as string[],
    }

    // 4. Inserimento del profilo completo nella tabella 'profiles'
    const { error: profileError } = await supabaseAdmin.from("profiles").insert({
      id: newUserId,
      email,
      role: "operator",
      full_name: fullName,
      stage_name: stageName,
      phone: details.phone,
      bio: details.bio,
      commission_rate: details.commission,
      status: details.status,
      is_online: details.isOnline,
      main_discipline: details.categories[0],
      specialties,
      service_prices: services,
      availability_schedule: availability,
      profile_image_url: publicAvatarUrl,
    })

    if (profileError) {
      // Se l'inserimento del profilo fallisce, scatena il blocco catch per il rollback
      throw new Error(`Errore durante la creazione del profilo: ${profileError.message}`)
    }
  } catch (error) {
    // Rollback: se siamo arrivati qui e newUserId esiste, qualcosa è andato storto dopo la creazione auth.
    if (newUserId) {
      await supabaseAdmin.auth.admin.deleteUser(newUserId)
    }
    const errorMessage = error instanceof Error ? error.message : "Errore sconosciuto del server."
    return { errors: { server: [errorMessage] }, message: errorMessage, success: false }
  }

  // 5. Successo
  revalidatePath("/admin/operators")
  revalidatePath("/") // Revalida anche la home page
  return { success: true, message: `Operatore ${stageName} creato con successo!` }
}

// --- FUNZIONI ESISTENTI ---

export async function getAllOperatorsForAdmin() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("admin_operators_view")
    .select("*")
    .order("joined_at", { ascending: false })

  if (error) {
    console.error("Error fetching operators for admin:", error)
    throw new Error("Impossibile caricare gli operatori.")
  }
  return data
}

export async function getOperators(options?: { limit?: number; category?: string }): Promise<Profile[]> {
  const supabase = createClient()
  let query = supabase
    .from("profiles")
    .select(
      `id, full_name, stage_name, bio, is_available, profile_image_url, service_prices, average_rating, review_count, categories ( name, slug )`,
    )
    .eq("role", "operator")
    .eq("status", "Attivo")

  if (options?.category) {
    query = query.filter("categories.slug", "eq", options.category)
  }
  if (options?.limit) {
    query = query.limit(options.limit)
  }
  query = query
    .order("is_online", { ascending: false })
    .order("average_rating", { ascending: false, nullsFirst: false })

  const { data, error } = await query
  if (error) throw new Error(`Error fetching operators: ${error.message}`)
  if (!data) return []

  return data.map((profile: any) => ({
    ...profile,
    specializations: profile.categories ? profile.categories.map((cat: any) => cat.name) : [],
  })) as Profile[]
}

export async function getOperatorByStageName(stageName: string): Promise<Profile | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("profiles")
    .select(
      `id, full_name, stage_name, bio, is_available, profile_image_url, service_prices, average_rating, review_count, status, categories ( name, slug )`,
    )
    .eq("stage_name", stageName)
    .eq("role", "operator")
    .single()

  if (error) {
    console.error("Error fetching operator by stage name:", error)
    return null
  }
  if (!data) return null

  return {
    ...data,
    specializations: (data as any).categories ? (data as any).categories.map((cat: any) => cat.name) : [],
  } as Profile
}

export async function getOperatorForEdit(operatorId: string) {
  const supabase = createClient()
  const { data, error } = await supabase.from("admin_operators_view").select("*").eq("id", operatorId).single()
  if (error) throw new Error("Operatore non trovato o errore nel caricamento.")
  return data
}

export async function updateOperatorProfile(operatorId: string, profileData: any) {
  const supabaseAdmin = createSupabaseAdminClient()
  // Qui dovresti anche gestire l'upload di un nuovo avatar se fornito
  const { error } = await supabaseAdmin
    .from("profiles")
    .update(profileData) // Assumendo che profileData contenga solo campi validi
    .eq("id", operatorId)

  if (error) {
    return { success: false, message: `Errore durante l'aggiornamento del profilo: ${error.message}` }
  }

  revalidatePath("/admin/operators")
  revalidatePath(`/admin/operators/${operatorId}/edit`)
  return { success: true, message: "Profilo operatore aggiornato con successo." }
}

export async function updateOperatorCommission(operatorId: string, commission: number) {
  if (commission < 0 || commission > 100) {
    return { success: false, message: "La commissione deve essere tra 0 e 100." }
  }
  const supabaseAdmin = createSupabaseAdminClient()
  const { error } = await supabaseAdmin.from("profiles").update({ commission_rate: commission }).eq("id", operatorId)

  if (error) return { success: false, message: "Errore durante l'aggiornamento della commissione." }

  revalidatePath("/admin/operators")
  revalidatePath(`/admin/operators/${operatorId}/edit`)
  return { success: true, message: "Commissione aggiornata con successo." }
}

export async function suspendOperator(operatorId: string) {
  const supabaseAdmin = createSupabaseAdminClient()
  const { error } = await supabaseAdmin
    .from("profiles")
    .update({ status: "suspended", is_available: false })
    .eq("id", operatorId)

  if (error) return { success: false, message: "Errore durante la sospensione." }

  revalidatePath("/admin/operators")
  return { success: true, message: "Operatore sospeso." }
}
