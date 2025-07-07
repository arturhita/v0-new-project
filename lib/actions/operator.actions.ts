"use server"

import { createClient } from "@/lib/supabase/server"

// Interfaccia per i dati della Operator Card, usata in tutto il frontend
export interface OperatorCardDataInterface {
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

/**
 * Recupera dal database tutti gli operatori approvati e visibili.
 * Calcola la valutazione media e formatta i servizi.
 */
export async function getApprovedOperators(): Promise<OperatorCardDataInterface[]> {
  const supabase = createClient()

  const { data: operators, error } = await supabase
    .from("profiles")
    .select(
      `
      id,
      full_name,
      avatar_url,
      headline,
      bio,
      is_online,
      specializations,
      created_at,
      services (
        type,
        price_per_minute,
        price_per_consultation
      ),
      reviews!reviews_operator_id_fkey (
        rating
      )
    `
    )
    .eq("role", "operator")
    .eq("application_status", "approved")
    .eq("is_visible", true)

  if (error) {
    console.error("Error fetching approved operators:", error)
    return []
  }

  // Trasformiamo i dati grezzi nel formato atteso dal frontend
  return operators.map((op) => {
    const reviews = op.reviews || []
    const reviewsCount = reviews.length
    const averageRating = reviewsCount > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewsCount : 0

    const operatorServices = (op.services || []).map((service) => ({
      type: service.type as "chat" | "call" | "email",
      price: service.price_per_minute ?? service.price_per_consultation,
    }))

    return {
      id: op.id,
      fullName: op.full_name,
      avatarUrl: op.avatar_url,
      headline: op.headline,
      isOnline: op.is_online,
      specializations: op.specializations || [],
      averageRating: parseFloat(averageRating.toFixed(1)),
      reviewsCount: reviewsCount,
      services: operatorServices,
      joinedDate: op.created_at,
      bio: op.bio,
    }
  })
}
