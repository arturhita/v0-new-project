"use server"

import { createClient } from "@/lib/supabase/server"
import type { Operator as OperatorCardType } from "@/components/operator-card"
import type { Review as ReviewCardType } from "@/components/review-card"

// Helper function to map Supabase profile to OperatorCardType
const mapProfileToOperator = (profile: any): OperatorCardType => {
  const services = profile.services || {}
  return {
    id: profile.id,
    name: profile.stage_name || "Operatore",
    avatarUrl: profile.avatar_url,
    specialization: (profile.categories && profile.categories[0]) || "Nessuna specializzazione",
    rating: profile.rating || 0,
    reviewsCount: profile.reviews_count || 0,
    description: profile.bio || "Nessuna biografia disponibile.",
    tags: profile.specialties || [],
    isOnline: profile.is_online || false,
    services: {
      chatPrice: services.chat?.price_per_minute,
      callPrice: services.call?.price_per_minute,
      emailPrice: services.email?.price,
    },
    joinedDate: profile.created_at,
  }
}

export async function getOperators(options: {
  category?: string
  limit?: number
  sortBy?: string
  ascending?: boolean
  onlineOnly?: boolean
  searchTerm?: string
}): Promise<OperatorCardType[]> {
  const { category, limit, sortBy = "created_at", ascending = false, onlineOnly = false, searchTerm } = options
  const supabase = createClient()
  let query = supabase.from("profiles").select("*").eq("role", "operator").eq("status", "Attivo")

  if (category && category !== "all") {
    query = query.contains("categories", [decodeURIComponent(category)])
  }

  if (onlineOnly) {
    query = query.eq("is_online", true)
  }

  if (searchTerm) {
    query = query.or(`stage_name.ilike.%${searchTerm}%,bio.ilike.%${searchTerm}%`)
  }

  if (sortBy) {
    if (sortBy === "rating") {
      query = query.order("created_at", { ascending: false }) // Fallback sort
    } else {
      query = query.order(sortBy, { ascending })
    }
  }

  if (limit) {
    query = query.limit(limit)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching operators:", error)
    return []
  }

  return data.map(mapProfileToOperator)
}

export async function getRecentReviews(): Promise<ReviewCardType[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("reviews")
    .select(
      `
      id,
      rating,
      comment,
      operator:profiles!reviews_operator_id_fkey (
        stage_name,
        avatar_url
      ),
      client:profiles!reviews_client_id_fkey (
        stage_name
      )
    `,
    )
    .order("created_at", { ascending: false })
    .limit(5)

  if (error) {
    console.error("CRITICAL: Error fetching recent reviews. Check table relationships.", error)
    return []
  }

  return data.map((review) => ({
    id: review.id,
    rating: review.rating,
    comment: review.comment,
    operator_name: (review.operator as { stage_name: string })?.stage_name || "Operatore",
    operator_avatar_url: (review.operator as { avatar_url: string })?.avatar_url,
    client_name: (review.client as { stage_name: string })?.stage_name || "Cliente",
  }))
}

export async function getOperatorByStageName(stageName: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "operator")
    .ilike("stage_name", stageName) // Case-insensitive search
    .single()

  if (error) {
    console.error(`Error fetching operator by stage name ${stageName}:`, error)
    return null
  }
  return data
}

export async function getReviewsForOperator(operatorId: string): Promise<ReviewCardType[]> {
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
      )
    `,
    )
    .eq("operator_id", operatorId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error(`Error fetching reviews for operator ${operatorId}:`, error)
    return []
  }

  // Map the data to a more usable format
  return data.map((review) => ({
    id: review.id,
    rating: review.rating,
    comment: review.comment,
    created_at: review.created_at,
    client_name: (review.client as { stage_name: string } | null)?.stage_name || "Utente Anonimo",
    client_avatar_url: (review.client as { avatar_url: string } | null)?.avatar_url,
  }))
}
