"use server"

import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { OperatorProfileSchema } from "../schemas"

// Funzione di supporto per convertire in modo sicuro le stringhe in numeri.
const safeParseFloat = (value: any): number => {
  if (value === null || value === undefined || String(value).trim() === "") return 0
  const num = Number.parseFloat(String(value))
  return isNaN(num) ? 0 : num
}

// Definizione del tipo per il profilo pubblico
export type OperatorPublicProfile = {
  id: string
  stage_name: string | null
  avatar_url: string | null
  specialization: string[] | null
  bio: string | null
  rating: number | null
  reviews_count: number | null
  services: { service_type: string; price: number }[] | null
  availability: any[] | null
  reviews: any[] | null
  is_online: boolean | null
  tags: string[] | null
  experience?: string | null // Campo per tab "Esperienza"
  specializations_details?: string | null // Campo per tab "Specializzazioni"
}

export async function createOperator(
  prevState: { message: string; success: boolean; tempPassword?: string },
  formData: FormData,
): Promise<{ message: string; success: boolean; tempPassword?: string }> {
  const supabaseAdmin = createAdminClient()

  const validatedFields = OperatorProfileSchema.safeParse(Object.fromEntries(formData.entries()))

  if (!validatedFields.success) {
    return {
      message: "Dati non validi: " + JSON.stringify(validatedFields.error.flatten().fieldErrors),
      success: false,
    }
  }

  const {
    email,
    full_name,
    stage_name,
    bio,
    specialization,
    tags,
    chat_price,
    call_price,
    written_price,
    experience,
    specializations_details,
  } = validatedFields.data

  // 1. Genera password temporanea
  const tempPassword = Math.random().toString(36).slice(-12)

  // 2. Crea utente in Supabase Auth
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: email,
    password: tempPassword,
    email_confirm: true, // L'utente è già confermato
    user_metadata: {
      full_name: full_name,
      role: "operator",
    },
  })

  if (authError) {
    console.error("Errore creazione utente in Auth:", authError)
    return { message: `Errore creazione utente: ${authError.message}`, success: false }
  }

  const userId = authData.user.id

  // Gestione sicura dei campi opzionali
  const specializationArray = specialization ? specialization.split(",").map((s) => s.trim()) : []
  const tagsArray = tags ? tags.split(",").map((t) => t.trim()) : []

  // 3. Aggiorna il profilo dell'utente
  const { error: profileError } = await supabaseAdmin
    .from("profiles")
    .update({
      full_name: full_name,
      stage_name: stage_name,
      bio: bio,
      specialization: specializationArray,
      tags: tagsArray,
      role: "operator",
      experience: experience,
      specializations_details: specializations_details,
    })
    .eq("id", userId)

  if (profileError) {
    console.error("Errore aggiornamento profilo:", profileError)
    // Tenta di eliminare l'utente Auth creato per pulizia
    await supabaseAdmin.auth.admin.deleteUser(userId)
    return { message: `Errore aggiornamento profilo: ${profileError.message}`, success: false }
  }

  // 4. Inserisci i servizi
  const servicesToInsert = []
  if (chat_price) servicesToInsert.push({ user_id: userId, service_type: "chat", price: chat_price, is_active: true })
  if (call_price) servicesToInsert.push({ user_id: userId, service_type: "call", price: call_price, is_active: true })
  if (written_price)
    servicesToInsert.push({ user_id: userId, service_type: "written", price: written_price, is_active: true })

  if (servicesToInsert.length > 0) {
    const { error: servicesError } = await supabaseAdmin.from("operator_services").insert(servicesToInsert)
    if (servicesError) {
      console.error("Errore inserimento servizi:", servicesError)
      // Tenta di eliminare l'utente Auth e il profilo per pulizia
      await supabaseAdmin.auth.admin.deleteUser(userId)
      return { message: `Errore inserimento servizi: ${servicesError.message}`, success: false }
    }
  }

  revalidatePath("/admin/operators")
  revalidatePath(`/operator/${stage_name}`)

  return {
    message: "Operatore creato con successo!",
    success: true,
    tempPassword: tempPassword,
  }
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
  } catch (error) {
    console.error("Errore aggiornamento commissione:", error)
    return {
      success: false,
      message: "Errore nell'aggiornamento della commissione",
    }
  }
}

/**
 * Recupera il profilo pubblico completo di un operatore per la sua pagina vetrina.
 * @param stageName - Lo username pubblico (stage_name) dell'operatore.
 * @returns Un oggetto contenente tutti i dati del profilo, o null se non trovato.
 */
export async function getOperatorPublicProfile(stageName: string): Promise<OperatorPublicProfile | null> {
  const supabase = createClient()
  const { data: profile, error } = await supabase
    .from("profiles")
    .select(
      `
      id,
      stage_name,
      avatar_url,
      specialization,
      bio,
      average_rating,
      reviews_count,
      is_online,
      tags,
      experience,
      specializations_details,
      operator_services (
        service_type,
        price
      ),
      operator_availability (
        day_of_week,
        start_time,
        end_time
      ),
      reviews (
        id,
        rating,
        comment,
        created_at,
        client:client_id (
          full_name,
          avatar_url
        )
      )
    `,
    )
    .eq("stage_name", stageName)
    .eq("role", "operator")
    .limit(5, { referencedTable: "reviews" })
    .order("created_at", { referencedTable: "reviews", ascending: false })
    .single()

  if (error || !profile) {
    console.error("Error fetching operator public profile:", error?.message)
    return null
  }

  // Mappatura dei dati per coerenza
  return {
    id: profile.id,
    stage_name: profile.stage_name,
    avatar_url: profile.avatar_url,
    specialization: profile.specialization,
    bio: profile.bio,
    rating: profile.average_rating,
    reviews_count: profile.reviews_count,
    services: profile.operator_services,
    availability: profile.operator_availability.map((a) => ({
      day: a.day_of_week,
      start_time: a.start_time.substring(0, 5),
      end_time: a.end_time.substring(0, 5),
    })),
    reviews: profile.reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.created_at,
      author: {
        name: r.client?.full_name || "Utente",
        avatarUrl: r.client?.avatar_url,
      },
    })),
    is_online: profile.is_online,
    tags: profile.tags,
    experience: profile.experience,
    specializations_details: profile.specializations_details,
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

export async function getAllOperatorsForAdmin() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, stage_name, email, is_online, created_at")
    .eq("role", "operator")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching operators for admin:", error)
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

export async function updateOperatorProfile(
  userId: string,
  profileData: {
    full_name?: string
    bio?: string
    specialization?: string[]
    tags?: string[]
  },
) {
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
