"use server"

import { createClient } from "@/lib/supabase/server"
import type { Operator } from "@/components/operator-card"
import type { Review } from "@/components/review-card"

export async function getFeaturedOperators(): Promise<Operator[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("profiles")
    .select(`
      id,
      username,
      profile_picture_url,
      specializations,
      average_rating,
      total_reviews,
      is_online
    `)
    .eq("role", "operator")
    .eq("status", "approved")
    .order("average_rating", { ascending: false, nulls: "last" })
    .limit(4)

  if (error) {
    console.error("Error fetching featured operators:", error.message)
    return []
  }

  // The data from Supabase should match the Operator type.
  // We can add logic for `is_new` if needed, e.g., based on creation date.
  return data.map((op) => ({ ...op, is_new: false })) as Operator[]
}

export async function getRecentReviews(): Promise<Review[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("reviews")
    .select(`
      id,
      rating,
      comment,
      created_at,
      client:profiles!reviews_client_id_fkey ( username ),
      operator:profiles!reviews_operator_id_fkey ( username )
    `)
    .order("created_at", { ascending: false })
    .limit(3)

  if (error) {
    console.error("Error fetching recent reviews:", error.message)
    return []
  }

  // Transform the data to match the Review type
  return data.map((review) => ({
    id: review.id,
    rating: review.rating,
    comment: review.comment,
    created_at: review.created_at,
    client_username: (review.client as { username: string })?.username || "Utente",
    operator_name: (review.operator as { username: string })?.username || "Operatore",
  }))
}
