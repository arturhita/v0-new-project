"use server"

import { supabaseAdmin } from "@/lib/supabase/admin"
import type { Operator } from "@/components/operator-card"
import type { Review } from "@/components/review-card"
import { getCurrentPromotionPrice } from "./promotions.actions"

export const mapProfileToOperator = (profile: any, promotionPrice: number | null): Operator => {
  // THE DEFINITIVE, ISOLATED FIX:
  // Sanitize the individual profile object at the very beginning of the mapping process.
  // This is the most robust approach as it ensures that any logic within this function
  // operates on a plain, safe JavaScript object, free from any Supabase proxies or getters.
  const cleanProfile = JSON.parse(JSON.stringify(profile))

  const services = cleanProfile.services || {}
  const chatService = services.chat || {}
  const callService = services.call || {}
  const emailService = services.email || {}

  const chatPrice =
    promotionPrice !== null ? promotionPrice : chatService.enabled ? chatService.price_per_minute : undefined
  const callPrice =
    promotionPrice !== null ? promotionPrice : callService.enabled ? callService.price_per_minute : undefined
  const emailPrice =
    promotionPrice !== null ? promotionPrice * 6 : emailService.enabled ? emailService.price : undefined

  return {
    id: cleanProfile.id,
    name: cleanProfile.stage_name || "Operatore",
    avatarUrl: cleanProfile.avatar_url || "/placeholder.svg",
    specialization:
      (cleanProfile.specialties && cleanProfile.specialties[0]) ||
      (cleanProfile.categories && cleanProfile.categories[0]) ||
      "Esperto",
    rating: cleanProfile.average_rating || 0,
    reviewsCount: cleanProfile.reviews_count || 0,
    description: cleanProfile.bio || "Nessuna descrizione disponibile.",
    tags: cleanProfile.categories || [],
    isOnline: cleanProfile.is_online || false,
    services: {
      chatPrice,
      callPrice,
      emailPrice,
    },
    profileLink: `/operator/${cleanProfile.stage_name}`,
    joinedDate: cleanProfile.created_at,
  }
}

export async function getHomepageData() {
  const supabase = supabaseAdmin
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
      throw new Error("Database error fetching operators.")
    }
    if (reviewsError) {
      console.error("Error fetching recent reviews:", reviewsError)
      throw new Error("Database error fetching reviews.")
    }

    // Pass the raw data to the mapper. The mapper is now responsible for sanitization.
    const operators = (operatorsData || []).map((profile) => mapProfileToOperator(profile, promotionPrice))

    // Sanitize reviews data here as it doesn't have a complex dedicated mapper.
    const cleanReviewsData = JSON.parse(JSON.stringify(reviewsData || []))
    const reviews = cleanReviewsData.map(
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
    throw error
  }
}

export async function getOperatorsByCategory(categorySlug: string) {
  const supabase = supabaseAdmin
  const slug = decodeURIComponent(categorySlug)
  const promotionPrice = await getCurrentPromotionPrice()

  const { data, error } = await supabase.rpc("get_operators_by_category_case_insensitive", {
    category_slug: slug,
  })

  if (error) {
    console.error(`Error fetching operators for category ${slug} via RPC:`, error.message)
    return []
  }

  // Pass raw data to the mapper.
  return (data || []).map((profile) => mapProfileToOperator(profile, promotionPrice))
}

export async function getAllOperators() {
  const supabase = supabaseAdmin
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

  // Pass raw data to the mapper.
  return (data || []).map((profile) => mapProfileToOperator(profile, promotionPrice))
}
