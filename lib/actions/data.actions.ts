"use server"

import { createClient } from "@/lib/supabase/server"
import type { Operator } from "@/components/operator-card"
import type { Review } from "@/components/review-card"
import { getCurrentPromotionPrice } from "./promotions.actions"

export const mapProfileToOperator = (profile: any, promotionPrice: number | null): Operator => {
  const services = (profile.services as any) || {}
  const chatService = services.chat || {}
  const callService = services.call || {}
  const emailService = services.email || {}

  // Apply promotion price if available
  const chatPrice =
    promotionPrice !== null ? promotionPrice : chatService.enabled ? chatService.price_per_minute : undefined
  const callPrice =
    promotionPrice !== null ? promotionPrice : callService.enabled ? callService.price_per_minute : undefined
  // Email price is usually different, let's say it's 6x the per-minute price
  const emailPrice =
    promotionPrice !== null ? promotionPrice * 6 : emailService.enabled ? emailService.price : undefined

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
      chatPrice,
      callPrice,
      emailPrice,
    },
    profileLink: `/operator/${profile.stage_name}`,
    joinedDate: profile.created_at,
  }
}

export async function getHomepageData() {
  const supabase = createClient()
  const promotionPrice = await getCurrentPromotionPrice()

  try {
    const [operatorsResult, reviewsResult] = await Promise.all([
      supabase
        .from("profiles")
        .select(`*`)
        .eq("role", "operator")
        .eq("status", "Attivo")
        .order("is_online", { ascending: false })
        .limit(8),
      supabase
        .from("reviews")
        .select(
          `
       id, rating, comment, created_at,
       client:profiles!reviews_client_id_fkey (full_name, avatar_url),
       operator:profiles!reviews_operator_id_fkey (stage_name)
     `,
        )
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(3),
    ])

    const { data: operatorsData, error: operatorsError } = operatorsResult
    const { data: reviewsData, error: reviewsError } = reviewsResult

    if (operatorsError) {
      console.error("Error fetching homepage operators:", operatorsError)
      throw operatorsError
    }
    if (reviewsError) {
      console.error("Error fetching recent reviews:", reviewsError)
      throw reviewsError
    }

    const operators = (operatorsData || []).map((profile) => mapProfileToOperator(profile, promotionPrice))
    const reviews = (reviewsData || []).map(
      (review: any) =>
        ({
          id: review.id,
          user_name: review.client?.full_name || "Utente Anonimo",
          user_type: "Utente",
          operator_name: review.operator?.stage_name || "Operatore",
          rating: review.rating,
          comment: review.comment,
          created_at: review.created_at,
        }) as Review,
    )

    return { operators, reviews }
  } catch (error) {
    console.error("A general error occurred while fetching homepage data:", error)
    return { operators: [], reviews: [] }
  }
}

export async function getOperatorsByCategory(categorySlug: string) {
  const supabase = createClient()
  const slug = decodeURIComponent(categorySlug)
  const promotionPrice = await getCurrentPromotionPrice()

  const { data, error } = await supabase.rpc("get_operators_by_category_case_insensitive", {
    category_slug: slug,
  })

  if (error) {
    console.error(`Error fetching operators for category ${slug} via RPC:`, error.message)
    return []
  }

  return (data || []).map((profile) => mapProfileToOperator(profile, promotionPrice))
}

export async function getAllOperators() {
  const supabase = createClient()
  const promotionPrice = await getCurrentPromotionPrice()

  const { data, error } = await supabase
    .from("profiles")
    .select(`*`)
    .eq("role", "operator")
    .eq("status", "Attivo")
    .order("is_online", { ascending: false })

  if (error) {
    console.error(`Error fetching all operators:`, error.message)
    return []
  }

  return (data || []).map((profile) => mapProfileToOperator(profile, promotionPrice))
}
