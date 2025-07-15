"use server"

import { createClient } from "@/lib/supabase/server"
import { unstable_noStore as noStore } from "next/cache"

export async function getOperatorByStageName(stageName: string) {
  noStore()
  const supabase = createClient()
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .ilike("stage_name", stageName)
    .eq("role", "operator")
    .single()

  if (error) {
    console.error("Error fetching operator by stage name:", error.message)
    return null
  }

  return data
}

export async function getReviewsForOperator(operatorId: string) {
  noStore()
  const supabase = createClient()
  const { data, error } = await supabase
    .from("reviews")
    .select(
      `
      id,
      rating,
      comment,
      created_at,
      profiles (
        stage_name,
        avatar_url
      )
    `,
    )
    .eq("operator_id", operatorId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching reviews for operator:", error.message)
    return []
  }

  return data.map((review) => ({
    ...review,
    client_name: (review.profiles as any)?.stage_name || "Anonimo",
    client_avatar_url: (review.profiles as any)?.avatar_url,
  }))
}

export async function getRecentReviews(limit = 5) {
  noStore()
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
        stage_name,
        avatar_url
      ),
      operator:profiles!reviews_operator_id_fkey (
        stage_name
      )
    `,
    )
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("Error fetching recent reviews:", error.message)
    return []
  }

  return data.map((review) => ({
    id: review.id,
    rating: review.rating,
    comment: review.comment,
    date: review.created_at,
    userName: (review.client as any)?.stage_name || "Cliente",
    userAvatar: (review.client as any)?.avatar_url,
    operatorName: (review.operator as any)?.stage_name || "Operatore",
  }))
}

export async function getFeaturedOperators(limit = 4) {
  noStore()
  const supabase = createClient()
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "operator")
    .eq("is_online", true) // Prefer online operators
    .limit(limit)

  if (error) {
    console.error("Error fetching featured operators:", error.message)
    return []
  }

  return data
}
