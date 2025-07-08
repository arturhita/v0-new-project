"use server"

import { createClient } from "@/lib/supabase/server"
import type { Operator } from "@/components/operator-card"
import type { Review } from "@/components/review-card"

export async function getApprovedOperators(): Promise<Operator[]> {
  const supabase = createClient()

  // The correct approach is to query from the central 'profiles' table
  // and join the related data, filtering on the joined table.
  const { data, error } = await supabase
    .from("profiles")
    .select(
      `
      id,
      name,
      avatar_url,
      created_at,
      operator_profiles!inner (
          id,
          is_online,
          tags,
          chat_price_per_minute,
          call_price_per_minute,
          email_price,
          average_rating,
          reviews_count,
          application_status
      ),
      operator_details!inner (
          stage_name,
          bio,
          specialties
      )
    `,
    )
    .eq("operator_profiles.application_status", "approved")
    .limit(8)

  if (error) {
    console.error("Error fetching approved operators:", error)
    return []
  }

  return data.map((p: any) => {
    const op = p.operator_profiles
    const od = p.operator_details

    return {
      id: op.id, // Use operator_profiles.id as the main ID for operator-related things
      name: od.stage_name || p.name,
      avatarUrl: p.avatar_url || null,
      specialization: od.specialties?.[0] || "N/A",
      rating: op.average_rating || 0,
      reviewsCount: op.reviews_count || 0,
      description: od.bio || "Nessuna descrizione.",
      tags: op.tags || [],
      isOnline: op.is_online || false,
      services: {
        chatPrice: op.chat_price_per_minute,
        callPrice: op.call_price_per_minute,
        emailPrice: op.email_price,
      },
      joinedDate: p.created_at,
    }
  })
}

export async function getRecentReviews(): Promise<Review[]> {
  const supabase = createClient()
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
          operator_details:user_id (
            stage_name
          )
        )
      )
    `,
    )
    .order("created_at", { ascending: false })
    .limit(10)

  if (error) {
    console.error("Error fetching recent reviews:", error)
    return []
  }

  return data.map((r: any) => {
    const clientProfile = r.client
    const operatorDetails = r.operator?.profiles?.operator_details

    return {
      id: r.id,
      date: r.created_at,
      rating: r.rating,
      comment: r.comment,
      userName: clientProfile?.name || "Utente Anonimo",
      operatorName: operatorDetails?.stage_name || "Operatore",
      userType: "Utente", // Placeholder
    }
  })
}
