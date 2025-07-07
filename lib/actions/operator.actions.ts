"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { Operator } from "@/types/database"
import type { Review } from "@/components/review-card"

// Interfaccia per i dati della Operator Card, usata nelle liste
export interface OperatorCardData {
  id: string
  fullName: string | null
  avatarUrl: string | null
  headline: string | null
  isOnline: boolean
  specializations: string[]
  averageRating: number
  reviewsCount: number
  services: {
    type: "chat" | "call" | "email"
    price: number | null
  }[]
  joinedDate: string
  bio: string | null
}

// Interfaccia per i dati completi del profilo operatore
export interface DetailedOperatorProfile extends OperatorCardData {
  availability: Record<string, string[]>
  reviews: Review[]
}

// Funzione per trasformare i dati grezzi di Supabase nel formato atteso dal frontend
const transformOperatorData = (operator: any, detailed = false): OperatorCardData | DetailedOperatorProfile => {
  const reviewsRaw = operator.reviews || []
  const reviewsCount = reviewsRaw.length
  const averageRating =
    reviewsCount > 0 ? reviewsRaw.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / reviewsCount : 0

  const operatorServices = (operator.services || []).map((service: any) => ({
    type: service.type as "chat" | "call" | "email",
    price: service.price_per_minute ?? service.price_per_consultation,
  }))

  const baseData = {
    id: operator.id,
    fullName: operator.full_name,
    avatarUrl: operator.avatar_url,
    headline: operator.headline,
    isOnline: operator.is_online,
    specializations: operator.specializations || [],
    averageRating: Number.parseFloat(averageRating.toFixed(1)),
    reviewsCount: reviewsCount,
    services: operatorServices,
    joinedDate: operator.created_at,
    bio: operator.bio,
  }

  if (detailed) {
    const reviews: Review[] = reviewsRaw.map((r: any) => ({
      id: r.id,
      userName: r.client_profile?.full_name ?? "Utente",
      userType: "Utente",
      operatorName: operator.full_name,
      rating: r.rating,
      comment: r.comment,
      date: r.created_at,
    }))

    return {
      ...baseData,
      availability: operator.availability || {},
      reviews: reviews,
    }
  }

  return baseData
}

/**
 * Recupera dal database tutti gli operatori approvati e visibili.
 */
export async function getApprovedOperators(): Promise<OperatorCardData[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("operators")
    .select(
      `
      id, full_name, avatar_url, headline, bio, is_online, specializations, created_at,
      services ( type, price_per_minute, price_per_consultation ),
      reviews!reviews_operator_id_fkey ( rating )
    `,
    )
    .eq("application_status", "approved")
    .eq("is_visible", true)

  if (error) {
    console.error("Error fetching approved operators:", error)
    return []
  }
  return data.map((op) => transformOperatorData(op) as OperatorCardData)
}

/**
 * Recupera i dati dettagliati di un singolo operatore per la sua pagina profilo.
 */
export async function getOperatorById(id: string): Promise<DetailedOperatorProfile | null> {
  if (!id) return null
  const supabase = createClient()
  const { data, error } = await supabase
    .from("operators")
    .select(
      `
      *,
      services ( type, price_per_minute, price_per_consultation ),
      reviews ( id, rating, comment, created_at, client_profile:profiles!reviews_client_id_fkey(full_name) )
    `,
    )
    .eq("id", id)
    .single()

  if (error) {
    console.error(`Error fetching operator ${id}:`, error)
    return null
  }

  return transformOperatorData(data, true) as DetailedOperatorProfile
}

/**
 * Recupera gli operatori per una specifica categoria.
 */
export async function getOperatorsByCategory(categorySlug: string): Promise<OperatorCardData[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("operators")
    .select(
      `
      id, full_name, avatar_url, headline, bio, is_online, specializations, created_at,
      services ( type, price_per_minute, price_per_consultation ),
      reviews!reviews_operator_id_fkey ( rating )
    `,
    )
    .eq("application_status", "approved")
    .eq("is_visible", true)
    .cs("specializations", `{${categorySlug}}`)

  if (error) {
    console.error(`Error fetching operators for category ${categorySlug}:`, error)
    return []
  }
  return data.map((op) => transformOperatorData(op) as OperatorCardData)
}

export async function createOperator(formData: any) {
  const supabase = createClient()

  // NOTA: In un'applicazione reale, la creazione dell'utente (auth) andrebbe gestita separatamente.
  // Qui inseriamo i dati direttamente nel profilo operatore.
  const { services, availability, ...profileData } = formData

  const { data, error } = await supabase
    .from("operators")
    .insert({
      stage_name: profileData.stageName,
      full_name: `${profileData.name} ${profileData.surname}`,
      email: profileData.email,
      phone: profileData.phone,
      bio: profileData.bio,
      categories: profileData.categories,
      specialties: profileData.specialties,
      avatar_url: profileData.avatarUrl,
      status: profileData.status,
      commission_rate: Number.parseFloat(profileData.commission),
      is_online: profileData.isOnline,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating operator:", error)
    return { success: false, message: `Errore del database: ${error.message}` }
  }

  // TODO: Inserire i dati per i servizi e la disponibilità nelle tabelle correlate usando `data.id`

  revalidatePath("/admin/operators")
  return { success: true, message: "Operatore creato con successo." }
}

export async function getOperatorByUserId(userId: string) {
  if (!userId) return null
  const supabase = createClient()
  const { data, error } = await supabase.from("operators").select("*").eq("user_id", userId).single()
  if (error) {
    console.error("Error fetching operator by user ID:", error)
    return null
  }
  return data as Operator
}

export async function updateOperatorStatus(
  operatorId: string,
  isOnline: boolean,
  status: "Online" | "Offline" | "In Pausa",
) {
  const supabase = createClient()

  const { error } = await supabase
    .from("operators")
    .update({ is_online: isOnline, online_status: status })
    .eq("id", operatorId)

  if (error) {
    console.error("Error updating operator status:", error)
    return { success: false, message: error.message }
  }

  revalidatePath(`/(platform)/dashboard/operator`)
  return { success: true, message: "Stato aggiornato." }
}
