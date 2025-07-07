"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { DetailedOperatorProfile, OperatorCardData, Review, Service, Profile } from "@/types/database"

// Funzione helper per trasformare i dati del profilo in ciò che i componenti si aspettano
const transformProfileToOperatorCard = (profile: any): OperatorCardData => {
  const reviewsRaw = profile.reviews || []
  const reviewsCount = reviewsRaw.length
  const averageRating =
    reviewsCount > 0 ? reviewsRaw.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / reviewsCount : 0

  const operatorServices = (profile.services || []).map((service: any) => ({
    type: service.type,
    price: service.price_per_minute ?? service.price_per_consultation,
  }))

  return {
    id: profile.id,
    fullName: profile.full_name,
    avatarUrl: profile.avatar_url,
    headline: profile.headline,
    isOnline: profile.is_online,
    specializations: profile.specializations || [],
    averageRating: Number.parseFloat(averageRating.toFixed(1)),
    reviewsCount: reviewsCount,
    services: operatorServices,
  }
}

// Funzione per ottenere tutti gli operatori approvati e visibili
export async function getApprovedOperators(): Promise<OperatorCardData[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("profiles")
    .select(
      `
      id, full_name, avatar_url, headline, is_online, specializations,
      services ( type, price_per_minute, price_per_consultation ),
      reviews ( rating )
    `,
    )
    .eq("role", "operator")
    .eq("application_status", "approved")
    .eq("is_visible", true)

  if (error) {
    console.error("Error fetching approved operators:", error.message)
    return []
  }
  return data.map(transformProfileToOperatorCard)
}

// Funzione per ottenere gli operatori per categoria
export async function getOperatorsByCategory(categorySlug: string): Promise<OperatorCardData[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("profiles")
    .select(
      `
      id, full_name, avatar_url, headline, is_online, specializations,
      services ( type, price_per_minute, price_per_consultation ),
      reviews ( rating )
    `,
    )
    .eq("role", "operator")
    .eq("application_status", "approved")
    .eq("is_visible", true)
    .cs("specializations", `{${categorySlug}}`)

  if (error) {
    console.error(`Error fetching operators for category ${categorySlug}:`, error.message)
    return []
  }
  return data.map(transformProfileToOperatorCard)
}

// Funzione per ottenere il profilo dettagliato di un singolo operatore
export async function getOperatorById(id: string): Promise<DetailedOperatorProfile | null> {
  if (!id) return null
  const supabase = createClient()
  const { data, error } = await supabase
    .from("profiles")
    .select(
      `
      *,
      services ( * ),
      reviews ( *, client_profile:profiles!client_id(full_name) )
    `,
    )
    .eq("id", id)
    .eq("role", "operator")
    .single()

  if (error) {
    console.error(`Error fetching operator profile ${id}:`, error.message)
    return null
  }

  const reviewsRaw = data.reviews || []
  const reviewsCount = reviewsRaw.length
  const averageRating =
    reviewsCount > 0 ? reviewsRaw.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / reviewsCount : 0

  return {
    ...(data as Profile),
    services: data.services as Service[],
    reviews: data.reviews as Review[],
    averageRating: Number.parseFloat(averageRating.toFixed(1)),
    reviewsCount: reviewsCount,
  }
}

// Funzione per aggiornare lo stato online di un operatore
export async function updateOperatorStatus(
  operatorId: string,
  isOnline: boolean,
  status: "Online" | "Offline" | "In Pausa",
) {
  const supabase = createClient()
  const { error } = await supabase
    .from("profiles")
    .update({ is_online: isOnline, online_status: status, updated_at: new Date().toISOString() })
    .eq("id", operatorId)

  if (error) {
    console.error("Error updating operator status:", error)
    return { success: false, message: error.message }
  }

  revalidatePath(`/(platform)/dashboard/operator`)
  revalidatePath(`/operator/${operatorId}`)
  return { success: true, message: "Stato aggiornato." }
}
