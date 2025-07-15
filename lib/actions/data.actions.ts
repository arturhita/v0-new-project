"use server"

import { createServerClient } from "@/lib/supabase/server"

export async function getFeaturedOperators() {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from("profiles")
    .select(
      `
      id,
      stage_name,
      avatar_url,
      bio,
      categories,
      services,
      is_online
    `,
    )
    .eq("role", "operator")
    .eq("status", "Attivo")
    .limit(4)

  if (error) {
    console.error("Error fetching featured operators:", error)
    return []
  }

  return data.map((op) => ({
    id: op.id,
    name: op.stage_name,
    avatarUrl: op.avatar_url,
    description: op.bio,
    tags: op.categories,
    isOnline: op.is_online,
    services: op.services,
    profileLink: `/operator/${op.stage_name}`,
    specialization: op.categories?.[0] || "Esperto",
    rating: 5, // Placeholder, da implementare con le recensioni
    reviewsCount: 0, // Placeholder
  }))
}

export async function getRecentReviews() {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from("reviews")
    .select(
      `
      id,
      rating,
      comment,
      created_at,
      client:profiles!reviews_client_id_fkey (
        name,
        avatar_url
      ),
      operator:profiles!reviews_operator_id_fkey (
        stage_name
      )
    `,
    )
    .order("created_at", { ascending: false })
    .limit(5)

  if (error) {
    console.error("Error fetching recent reviews:", error)
    return []
  }

  return data.map((review) => ({
    id: review.id,
    userName: review.client?.name || "Utente Anonimo",
    userAvatar: review.client?.avatar_url,
    operatorName: review.operator?.stage_name || "Operatore",
    rating: review.rating,
    comment: review.comment,
    date: review.created_at,
  }))
}
