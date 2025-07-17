"use server"

import { createClient } from "@/lib/supabase/server"
import type { Operator } from "@/components/operator-card"
import type { Review } from "@/components/review-card"

// Funzione di supporto per mappare un profilo Supabase al tipo di dati atteso dal componente OperatorCard
const mapProfileToOperator = (profile: any): Operator => {
  const services = (profile.services as any) || {}
  const chatService = services.chat || {}
  const callService = services.call || {}
  const emailService = services.email || {}

  return {
    id: profile.id,
    name: profile.stage_name || "Operatore",
    avatarUrl: profile.avatar_url || "/placeholder.svg",
    specialization:
      (profile.specialties && profile.specialties[0]) || (profile.categories && profile.categories[0]) || "Esperto",
    rating: profile.average_rating || 0,
    reviewsCount: profile.reviews_count || 0,
    description: profile.bio || "Nessuna descrizione disponibile.",
    tags: profile.categories || [],
    isOnline: profile.is_online || false,
    services: {
      chatPrice: chatService.enabled ? chatService.price_per_minute : undefined,
      callPrice: callService.enabled ? callService.price_per_minute : undefined,
      emailPrice: emailService.enabled ? emailService.price : undefined,
    },
    profileLink: `/operator/${profile.stage_name}`,
    joinedDate: profile.created_at,
  }
}

/**
 * Recupera tutti i dati necessari per la homepage (operatori e recensioni).
 */
export async function getHomepageData() {
  const supabase = createClient()

  // Recupera gli operatori da mostrare in home, usando i campi pre-calcolati
  const { data: operatorsData, error: operatorsError } = await supabase
    .from("profiles")
    .select(`*`) // Semplificato: non serve più il join per il conteggio
    .eq("role", "operator")
    .eq("status", "Attivo")
    .order("is_online", { ascending: false })
    .limit(8)

  if (operatorsError) {
    console.error("Error fetching homepage operators:", operatorsError)
  }
  const operators = (operatorsData || []).map(mapProfileToOperator)

  // Recupera le recensioni recenti approvate
  const { data: reviewsData, error: reviewsError } = await supabase
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
      ),
      operator:profiles!reviews_operator_id_fkey (
        stage_name
      )
    `,
    )
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(3)

  if (reviewsError) {
    console.error("Error fetching recent reviews:", reviewsError)
  }

  const reviews = (reviewsData || []).map(
    (review) =>
      ({
        id: review.id,
        user_name: review.client?.full_name || "Utente Anonimo",
        user_type: "Utente", // Placeholder
        operator_name: review.operator?.stage_name || "Operatore",
        rating: review.rating,
        comment: review.comment,
        created_at: review.created_at,
      }) as Review,
  )

  return { operators, reviews }
}

/**
 * Recupera gli operatori attivi per una specifica categoria.
 * @param categorySlug - Lo slug della categoria (es. 'cartomanzia').
 */
export async function getOperatorsByCategory(categorySlug: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("profiles")
    .select(`*`) // Semplificato: non serve più il join per il conteggio
    .eq("role", "operator")
    .eq("status", "Attivo")
    .contains("categories", [categorySlug])

  if (error) {
    console.error(`Error fetching operators for category ${categorySlug}:`, error)
    return []
  }

  return (data || []).map(mapProfileToOperator)
}

export async function getFeaturedOperators() {
  const supabase = createClient()
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
      is_online,
      average_rating,
      reviews_count
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
    rating: op.average_rating || 0,
    reviewsCount: op.reviews_count || 0,
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
        full_name,
        avatar_url
      ),
      operator:profiles!reviews_operator_id_fkey (
        stage_name
      )
    `,
    )
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(5)

  if (error) {
    console.error("Error fetching recent reviews:", error)
    return []
  }

  return data.map((review) => ({
    id: review.id,
    userName: review.client?.full_name || "Utente Anonimo",
    userAvatar: review.client?.avatar_url,
    operatorName: review.operator?.stage_name || "Operatore",
    rating: review.rating,
    comment: review.comment,
    date: review.created_at,
  }))
}
