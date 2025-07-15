"use server"

import { createClient } from "@/lib/supabase/server"
import type { Operator } from "@/components/operator-card"

// Funzione helper per mappare in modo sicuro i dati del profilo DB al tipo Operator del componente
function mapProfileToOperator(profile: any): Operator {
  if (!profile) {
    return {} as Operator // Ritorna un oggetto vuoto se il profilo è nullo
  }

  const services = profile.services || {}
  const chatService = services.chat || {}
  const callService = services.call || {}
  const emailService = services.email || {}

  return {
    id: profile.id,
    name: profile.stage_name || "N/D",
    avatarUrl: profile.avatar_url,
    specialization: (profile.categories || []).join(", ") || "Nessuna specializzazione",
    rating: profile.average_rating || 0,
    reviewsCount: profile.reviews_count || 0,
    description: profile.bio || "Nessuna biografia disponibile.",
    tags: profile.specialties || [],
    isOnline: profile.is_online || false,
    services: {
      chatPrice: chatService.enabled ? chatService.price_per_minute : undefined,
      callPrice: callService.enabled ? callService.price_per_minute : undefined,
      emailPrice: emailService.enabled ? emailService.price : undefined,
    },
    joinedDate: profile.created_at,
  }
}

interface GetOperatorsOptions {
  category?: string
  onlineOnly?: boolean
  searchTerm?: string
  limit?: number
  sortBy?: string
  ascending?: boolean
}

export async function getOperators(options: GetOperatorsOptions = {}): Promise<Operator[]> {
  const supabase = createClient()
  const { category, onlineOnly, searchTerm, limit, sortBy = "created_at", ascending = false } = options

  let query = supabase.from("profiles").select("*").eq("role", "operator").eq("status", "Attivo")

  if (category && category !== "all" && category !== "tutti") {
    query = query.contains("categories", [decodeURIComponent(category)])
  }

  if (onlineOnly) {
    query = query.eq("is_online", true)
  }

  if (searchTerm) {
    query = query.or(`stage_name.ilike.%${searchTerm}%,specialties.cs.{${searchTerm}}`)
  }

  if (sortBy) {
    query = query.order(sortBy, { ascending })
  }

  if (limit) {
    query = query.limit(limit)
  }

  const { data: profiles, error } = await query

  if (error) {
    console.error("Error fetching operators:", error)
    return []
  }

  return profiles.map(mapProfileToOperator)
}

export async function getFeaturedOperators(limit = 4): Promise<Operator[]> {
  // Per ora, prendiamo gli operatori con rating più alto
  return getOperators({ limit, sortBy: "average_rating", ascending: false })
}

export async function getRecentReviews(limit = 3) {
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
        full_name,
        avatar_url
      )
    `,
    )
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("Error fetching recent reviews:", error)
    return []
  }

  return data.map((review: any) => ({
    id: review.id,
    rating: review.rating,
    comment: review.comment,
    date: review.created_at,
    userName: review.client?.full_name || "Utente Anonimo",
    userAvatar: review.client?.avatar_url,
  }))
}

export async function getOperatorStats(operatorId: string) {
  const supabase = createClient()

  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("average_rating, reviews_count")
    .eq("id", operatorId)
    .single()

  // Placeholder for other stats until their tables are created
  const { data: earningsData, error: earningsError } = await supabase.rpc("calculate_monthly_earnings", {
    p_operator_id: operatorId,
  })
  const { count: pendingCount, error: pendingError } = await supabase
    .from("written_consultations")
    .select("*", { count: "exact", head: true })
    .eq("operator_id", operatorId)
    .eq("status", "pending")

  if (profileError || earningsError || pendingError) {
    console.error({ profileError, earningsError, pendingError })
  }

  return {
    totalEarningsMonth: earningsData || 0,
    pendingConsultations: pendingCount || 0,
    averageRating: profileData?.average_rating || 0,
    totalConsultationsMonth: profileData?.reviews_count || 0, // Using reviews_count as a proxy
    newClientsMonth: 0, // Placeholder
  }
}

export async function getUnreadMessagesCount(userId: string): Promise<number> {
  // Placeholder implementation
  // In a real scenario, you would query your messages table
  // e.g., SELECT count(*) FROM messages WHERE recipient_id = userId AND is_read = false
  return 3
}
