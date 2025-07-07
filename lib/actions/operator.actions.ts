"use server"

import { createClient } from "@/lib/supabase/server"

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

// Funzione per trasformare i dati grezzi di Supabase nel formato atteso dal frontend
const transformOperatorData = (operator: any): OperatorCardData => {
  const reviews = operator.reviews || []
  const reviewsCount = reviews.length
  const averageRating =
    reviewsCount > 0 ? reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / reviewsCount : 0

  const operatorServices = (operator.services || []).map((service: any) => ({
    type: service.type as "chat" | "call" | "email",
    price: service.price_per_minute ?? service.price_per_consultation,
  }))

  return {
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
}

/**
 * Recupera dal database tutti gli operatori approvati e visibili.
 */
export async function getApprovedOperators(): Promise<OperatorCardData[]> {
  const supabase = createClient()

  const { data: operators, error } = await supabase
    .from("profiles")
    .select(
      `
      id, full_name, avatar_url, headline, bio, is_online, specializations, created_at,
      services ( type, price_per_minute, price_per_consultation ),
      reviews!reviews_operator_id_fkey ( rating )
    `,
    )
    .eq("role", "operator")
    .eq("application_status", "approved")
    .eq("is_visible", true)

  if (error) {
    console.error("Error fetching approved operators:", error)
    return []
  }

  return operators.map(transformOperatorData)
}

/**
 * Recupera un singolo operatore dal database tramite il suo ID.
 */
export async function getOperatorById(id: string): Promise<OperatorCardData | null> {
  const supabase = createClient()

  const { data: operator, error } = await supabase
    .from("profiles")
    .select(
      `
      id, full_name, avatar_url, headline, bio, is_online, specializations, created_at,
      services ( type, price_per_minute, price_per_consultation ),
      reviews!reviews_operator_id_fkey ( rating )
    `,
    )
    .eq("id", id)
    .eq("role", "operator")
    .single()

  if (error || !operator) {
    console.error(`Error fetching operator by ID ${id}:`, error)
    return null
  }

  return transformOperatorData(operator)
}
