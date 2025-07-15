"use server"

import { createClient } from "@/lib/supabase/server"
import { unstable_noStore as noStore } from "next/cache"
import type { Operator } from "@/components/operator-card"

// Helper function to map Supabase profile to the Operator type expected by components
const mapProfileToOperator = (profile: any): Operator => {
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
    profileLink: `/operator/${(profile.stage_name || "operatore").toLowerCase().replace(/ /g, "-")}`,
  }
}

export async function getOperators(options: {
  category?: string
  limit?: number
  sortBy?: string
  ascending?: boolean
  onlineOnly?: boolean
  searchTerm?: string
}): Promise<Operator[]> {
  noStore()
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

export async function getFeaturedOperators(limit = 4): Promise<Operator[]> {
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

  return data.map(mapProfileToOperator)
}
