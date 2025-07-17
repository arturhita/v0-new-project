"use server"

import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

// Funzione di supporto per convertire in modo sicuro le stringhe in numeri.
const safeParseFloat = (value: any): number => {
  if (value === null || value === undefined || String(value).trim() === "") return 0
  const num = Number.parseFloat(String(value))
  return isNaN(num) ? 0 : num
}

// Definizione del tipo per i dati inviati dal form di creazione
type OperatorData = {
  name: string
  surname: string
  stageName: string
  email: string
  phone: string
  bio: string
  specialties: string[]
  categories: string[]
  avatarUrl: string
  services: {
    chatEnabled: boolean
    chatPrice: string
    callEnabled: boolean
    callPrice: string
    emailEnabled: boolean
    emailPrice: string
  }
  availability: any
  status: "Attivo" | "In Attesa" | "Sospeso"
  isOnline: boolean
  commission: string
}

// Definizione del tipo per il profilo pubblico
export type OperatorPublicProfile = {
  id: string
  stage_name: string | null
  avatar_url: string | null
  specialties: string[] | null
  bio: string | null
  rating: number | null
  reviews_count: number | null
  services: { service_type: string; price: number }[] | null
  availability: any[] | null
  reviews: any[] | null
  is_online: boolean | null
  categories: string[] | null
}

export async function createOperator(operatorData: OperatorData) {
  const supabaseAdmin = createAdminClient()
  const password = Math.random().toString(36).slice(-12)
  let userId: string | undefined = undefined

  try {
    // 1. Crea utente in Supabase Auth. Questo esegue anche il trigger che crea la riga base nel profilo.
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: operatorData.email,
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: `${operatorData.name} ${operatorData.surname}`.trim(),
        stage_name: operatorData.stageName,
        avatar_url: operatorData.avatarUrl,
        role: "operator",
      },
    })

    if (authError || !authData.user) {
      console.error("Errore creazione utente Auth:", authError)
      if (authError?.message.includes("User already registered")) {
        return { success: false, message: "Un utente con questa email esiste già." }
      }
      return { success: false, message: `Errore Supabase Auth: ${authError?.message}` }
    }
    userId = authData.user.id

    // 2. Prepara i dati per la chiamata RPC
    const servicesToInsert = []
    if (operatorData.services.chatEnabled) {
      servicesToInsert.push({
        service_type: "chat",
        price: safeParseFloat(operatorData.services.chatPrice),
        is_active: true,
      })
    }
    if (operatorData.services.callEnabled) {
      servicesToInsert.push({
        service_type: "call",
        price: safeParseFloat(operatorData.services.callPrice),
        is_active: true,
      })
    }
    if (operatorData.services.emailEnabled) {
      servicesToInsert.push({
        service_type: "written_consultation",
        price: safeParseFloat(operatorData.services.emailPrice),
        is_active: true,
      })
    }

    const rpcParams = {
      p_user_id: userId,
      p_full_name: `${operatorData.name} ${operatorData.surname}`.trim(),
      p_stage_name: operatorData.stageName,
      p_phone: operatorData.phone,
      p_bio: operatorData.bio,
      p_avatar_url: operatorData.avatarUrl,
      p_status: operatorData.status,
      p_is_online: operatorData.isOnline,
      p_commission_rate: safeParseFloat(operatorData.commission),
      p_specialties: operatorData.specialties,
      p_categories: operatorData.categories,
      p_services: servicesToInsert,
      p_availability: operatorData.availability,
    }

    // 3. Chiama la funzione RPC per completare il profilo in un'unica transazione
    const { error: rpcError } = await supabaseAdmin.rpc("create_full_operator_profile", rpcParams)

    if (rpcError) {
      console.error("Errore RPC 'create_full_operator_profile':", rpcError)
      throw new Error(`Errore durante la creazione del profilo operatore: ${rpcError.message}`)
    }

    revalidatePath("/admin/operators")
    revalidatePath(`/operator/${operatorData.stageName}`)

    return {
      success: true,
      message: `Operatore ${operatorData.stageName} creato con successo!`,
      temporaryPassword: password,
    }
  } catch (error: any) {
    console.error("Errore nel processo di creazione operatore:", error)
    // Pulisce l'utente creato se qualcosa va storto dopo la sua creazione
    if (userId) {
      await supabaseAdmin.auth.admin.deleteUser(userId)
      console.log(`Utente Auth ${userId} eliminato a causa di un errore successivo.`)
    }
    return {
      success: false,
      message: error.message || "Si è verificato un errore sconosciuto durante la creazione.",
    }
  }
}

export async function getOperatorPublicProfile(stageName: string): Promise<OperatorPublicProfile | null> {
  const supabase = createClient()

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(
      `
      id,
      stage_name,
      avatar_url,
      specialties, 
      bio,
      average_rating,
      reviews_count,
      is_online,
      categories
      `,
    )
    .eq("stage_name", stageName)
    .eq("role", "operator")
    .single()

  if (profileError || !profile) {
    console.error("Error fetching operator profile:", profileError?.message)
    return null
  }

  const operatorId = profile.id

  const [servicesResult, availabilityResult, reviewsResult] = await Promise.all([
    supabase.from("operator_services").select("service_type, price").eq("user_id", operatorId),
    supabase.from("operator_availability").select("day_of_week, start_time, end_time").eq("user_id", operatorId),
    supabase
      .from("reviews")
      .select(`id, rating, comment, created_at, client:client_id (full_name, avatar_url)`)
      .eq("operator_id", operatorId)
      .order("created_at", { ascending: false })
      .limit(5),
  ])

  if (servicesResult.error) console.error("Error fetching operator services:", servicesResult.error.message)
  if (availabilityResult.error) console.error("Error fetching operator availability:", availabilityResult.error.message)
  if (reviewsResult.error) console.error("Error fetching operator reviews:", reviewsResult.error.message)

  const services = servicesResult.data || []
  const availability = availabilityResult.data || []
  const reviews = reviewsResult.data || []

  const combinedData: OperatorPublicProfile = {
    id: profile.id,
    stage_name: profile.stage_name,
    avatar_url: profile.avatar_url,
    specialties: profile.specialties,
    bio: profile.bio,
    rating: profile.average_rating,
    reviews_count: profile.reviews_count,
    services: services,
    availability: availability.map((a: any) => ({
      day: a.day_of_week,
      start_time: a.start_time.substring(0, 5),
      end_time: a.end_time.substring(0, 5),
    })),
    reviews: reviews.map((r: any) => ({
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
    categories: profile.categories,
  }

  return combinedData
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
    specialties?: string[]
    categories?: string[]
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
