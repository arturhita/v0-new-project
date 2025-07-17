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
    // 1. Crea utente in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: operatorData.email,
      password: password,
      email_confirm: true, // Conferma automatica dell'email
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

    // 2. Aggiorna il profilo creato dal trigger (senza availability)
    const profileToUpdate = {
      full_name: `${operatorData.name} ${operatorData.surname}`.trim(),
      stage_name: operatorData.stageName,
      phone: operatorData.phone,
      bio: operatorData.bio,
      avatar_url: operatorData.avatarUrl,
      role: "operator" as const,
      status: operatorData.status,
      is_online: operatorData.isOnline,
      commission_rate: safeParseFloat(operatorData.commission),
      specialties: operatorData.specialties,
      categories: operatorData.categories,
    }

    const { error: profileError } = await supabaseAdmin.from("profiles").update(profileToUpdate).eq("id", userId)

    if (profileError) {
      throw new Error(`Errore aggiornamento profilo: ${profileError.message}`)
    }

    // 3. Inserisci i servizi nella tabella operator_services
    const servicesToInsert = []
    if (operatorData.services.chatEnabled) {
      servicesToInsert.push({
        user_id: userId,
        service_type: "chat",
        price: safeParseFloat(operatorData.services.chatPrice),
        is_active: true,
      })
    }
    if (operatorData.services.callEnabled) {
      servicesToInsert.push({
        user_id: userId,
        service_type: "call",
        price: safeParseFloat(operatorData.services.callPrice),
        is_active: true,
      })
    }
    if (operatorData.services.emailEnabled) {
      servicesToInsert.push({
        user_id: userId,
        service_type: "written_consultation",
        price: safeParseFloat(operatorData.services.emailPrice),
        is_active: true,
      })
    }

    if (servicesToInsert.length > 0) {
      const { error: servicesError } = await supabaseAdmin.from("operator_services").insert(servicesToInsert)
      if (servicesError) {
        console.error("Raw services insertion error:", servicesError)
        throw new Error(`Errore inserimento servizi: ${servicesError.message || JSON.stringify(servicesError)}`)
      }
    }

    // 4. Inserisci la disponibilità nella tabella operator_availability
    const dayMapping: { [key: string]: number } = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
    }
    const availabilityToInsert = []
    for (const dayKey in operatorData.availability) {
      if (Object.prototype.hasOwnProperty.call(operatorData.availability, dayKey)) {
        const dayOfWeek = dayMapping[dayKey]
        const slots = operatorData.availability[dayKey as keyof typeof operatorData.availability]
        for (const slot of slots) {
          const [startTime, endTime] = slot.split("-")
          if (startTime && endTime) {
            availabilityToInsert.push({
              user_id: userId,
              day_of_week: dayOfWeek,
              start_time: `${startTime}:00`,
              end_time: `${endTime}:00`,
            })
          }
        }
      }
    }

    if (availabilityToInsert.length > 0) {
      const { error: availabilityError } = await supabaseAdmin
        .from("operator_availability")
        .insert(availabilityToInsert)
      if (availabilityError) {
        console.error("Raw availability insertion error:", availabilityError)
        throw new Error(
          `Errore inserimento disponibilità: ${availabilityError.message || JSON.stringify(availabilityError)}`,
        )
      }
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
    if (userId) {
      await supabaseAdmin.auth.admin.deleteUser(userId)
      console.log(`Utente Auth ${userId} eliminato a causa di un errore successivo.`)
    }
    return {
      success: false,
      message: error.message || "Si è verificato un errore sconosciuto.",
    }
  }
}

export async function getOperatorPublicProfile(stageName: string): Promise<OperatorPublicProfile | null> {
  const supabase = createClient()

  // Step 1: Fetch the main operator profile data
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
    console.error("Error fetching operator profile (step 1):", profileError?.message)
    return null
  }

  const operatorId = profile.id

  // Step 2: Fetch services, availability, and reviews in parallel
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

  // Step 3: Combine the data
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
