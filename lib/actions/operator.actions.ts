"use server"

import { createClient } from "@/lib/supabase/server"
import type { Profile } from "@/types/database"

// Definiamo un tipo specifico per il profilo pubblico dell'operatore
export type OperatorProfile = Pick<Profile, "id" | "full_name" | "avatar_url" | "headline" | "is_online"> & {
  specializations: string[]
  average_rating: number
  total_reviews: number
}

export async function getApprovedOperators(): Promise<OperatorProfile[]> {
  const supabase = createClient()

  // Selezioniamo i profili degli operatori approvati e visibili,
  // includendo le loro recensioni per calcolare la media.
  const { data, error } = await supabase
    .from("profiles")
    .select(
      `
      id,
      full_name,
      avatar_url,
      headline,
      is_online,
      specializations,
      reviews ( rating )
    `,
    )
    .eq("role", "operator")
    .eq("application_status", "approved")
    .eq("is_visible", true)

  if (error) {
    console.error("Error fetching approved operators:", error)
    return []
  }

  // Calcoliamo la valutazione media e il numero totale di recensioni per ogni operatore
  const operatorsWithRatings = data.map((operator) => {
    const reviews = operator.reviews || []
    const total_reviews = reviews.length
    const average_rating =
      total_reviews > 0 ? reviews.reduce((acc, review) => acc + review.rating, 0) / total_reviews : 0

    // Rimuoviamo l'array di recensioni dall'oggetto finale per pulizia
    const { reviews: _, ...rest } = operator

    return {
      ...rest,
      specializations: operator.specializations || [],
      average_rating: Number.parseFloat(average_rating.toFixed(1)),
      total_reviews,
    }
  })

  return operatorsWithRatings
}
