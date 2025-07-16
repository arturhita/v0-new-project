"use server"

import { createClient } from "@/lib/supabase/server"

export async function getOperators(options?: { limit?: number }) {
  const supabase = createClient()

  let query = supabase
    .from("profiles")
    .select(
      `
      id,
      stage_name,
      avatar_url,
      bio,
      categories,
      services,
      is_online,
      created_at
    `,
    )
    .eq("role", "operator")
    .eq("status", "Attivo")

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching operators:", error)
    return []
  }

  return data.map((op) => ({
    id: op.id,
    name: op.stage_name || "Operatore",
    avatarUrl: op.avatar_url,
    description: op.bio || "Nessuna descrizione.",
    tags: op.categories || [],
    isOnline: op.is_online || false,
    services: op.services || {},
    specialization: op.categories?.[0] || "Esperto",
    rating: 5, // Placeholder
    reviewsCount: 0, // Placeholder
    joinedDate: op.created_at,
  }))
}

export async function getRecentReviews() {
  const supabase = createClient()
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
    .limit(3)

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
