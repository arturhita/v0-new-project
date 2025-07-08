"use server"

import { createClient } from "@/lib/supabase/server"
import type { Operator } from "@/components/operator-card"
import type { Review } from "@/components/review-card"

export async function getApprovedOperators(): Promise<Operator[]> {
  const supabase = createClient()

  // Corrected Query: Start from operator_profiles and explicitly join related tables.
  const { data, error } = await supabase
    .from("operator_profiles")
    .select(
      `
      id,
      is_online,
      tags,
      chat_price_per_minute,
      call_price_per_minute,
      email_price,
      average_rating,
      reviews_count,
      profiles:user_id (
        id,
        name,
        avatar_url,
        created_at,
        operator_details:user_id (
          stage_name,
          bio,
          specialties
        )
      )
    `,
    )
    .eq("application_status", "approved")
    .limit(8)

  if (error) {
    console.error("Error fetching approved operators:", error.message)
    return []
  }

  return data
    .map((op: any) => {
      const profile = op.profiles
      if (!profile) return null

      // Supabase returns one-to-one joins as an array, so we take the first element.
      const details = profile.operator_details?.[0]

      return {
        id: op.id,
        name: details?.stage_name || profile.name,
        avatarUrl: profile.avatar_url || null,
        specialization: details?.specialties?.[0] || "Esperto",
        rating: op.average_rating || 0,
        reviewsCount: op.reviews_count || 0,
        description: details?.bio || "Nessuna descrizione.",
        tags: op.tags || [],
        isOnline: op.is_online || false,
        services: {
          chatPrice: op.chat_price_per_minute,
          callPrice: op.call_price_per_minute,
          emailPrice: op.email_price,
        },
        joinedDate: profile.created_at,
      }
    })
    .filter((p): p is Operator => p !== null)
}

export async function getRecentReviews(): Promise<Review[]> {
  const supabase = createClient()

  // Corrected Query: Use explicit joins following the foreign key relationships.
  const { data, error } = await supabase
    .from("reviews")
    .select(
      `
      id,
      created_at,
      rating,
      comment,
      client:client_id ( name ),
      operator:operator_id (
        profiles:user_id (
          operator_details (
            stage_name
          )
        )
      )
    `,
    )
    .order("created_at", { ascending: false })
    .limit(10)

  if (error) {
    console.error("Error fetching recent reviews:", error.message)
    return []
  }

  return data.map((r: any) => {
    const clientProfile = r.client
    const operatorDetails = r.operator?.profiles?.operator_details?.[0]

    return {
      id: r.id,
      date: r.created_at,
      rating: r.rating,
      comment: r.comment,
      userName: clientProfile?.name || "Utente Anonimo",
      operatorName: operatorDetails?.stage_name || "Operatore",
      userType: "Utente", // Placeholder, can be enhanced later
    }
  })
}
