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
    rating: profile.rating || 0, // Assuming a rating column exists or will be added
    reviewsCount: profile.reviews_count || 0, // Assuming a reviews_count column exists
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
    // Assuming categories are stored in an array field
    query = query.contains("categories", [decodeURIComponent(category)])
  }

  if (onlineOnly) {
    query = query.eq("is_online", true)
  }

  if (searchTerm) {
    query = query.or(`stage_name.ilike.%${searchTerm}%,bio.ilike.%${searchTerm}%`)
  }

  if (sortBy) {
    // Aggiungiamo un campo di rating fittizio se non esiste per l'ordinamento
    // In un'app reale, questo dovrebbe essere un campo calcolato o una vista DB
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
  const { data, error } = await supabase
    .from("reviews")
    .select(
      `
      *,
      client:profiles!client_id ( stage_name, avatar_url ),
      operator:profiles!operator_id ( stage_name )
    `,
    )
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("Error fetching recent reviews:", error)
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
