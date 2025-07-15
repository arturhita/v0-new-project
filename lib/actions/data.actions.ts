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

export async function getRecentReviews(limit = 3): Promise<ReviewCardType[]> {
  const supabase = createClient()

  // The primary fix for the error is the new SQL script (008-fix-reviews-relationship.sql).
  // This updated query explicitly uses the foreign key names for robustness.
  // The error handling prevents the entire page from crashing if the DB schema is still incorrect.
  const { data, error } = await supabase
    .from("reviews")
    .select(
      `
      *,
      client:profiles!reviews_client_id_fkey ( stage_name, avatar_url ),
      operator:profiles!reviews_operator_id_fkey ( stage_name )
    `,
    )
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("CRITICAL: Error fetching recent reviews:", error.message)
    console.error(
      "--> This likely means the database schema is incorrect. Please run the '008-fix-reviews-relationship.sql' script.",
    )
    return [] // Return an empty array to prevent the page from crashing.
  }

  if (!data) {
    return []
  }

  return data.map((review) => ({
    id: review.id,
    userName: review.client?.stage_name || "Utente Anonimo",
    userType: "Utente",
    operatorName: review.operator?.stage_name || "Operatore",
    rating: review.rating,
    comment: review.comment,
    date: review.created_at,
  }))
}

export async function getOperatorByStageName(stageName: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "operator")
    .eq("stage_name", decodeURIComponent(stageName))
    .single()

  if (error) {
    console.error("Error fetching operator by stage name:", error)
    return null
  }
  return data
}
