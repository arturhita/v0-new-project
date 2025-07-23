"use server"

import { supabaseAdmin } from "@/lib/supabase/admin"
import type { Operator } from "@/components/operator-card"
import type { Review } from "@/components/review-card"
import { getCurrentPromotionPrice } from "./promotions.actions"

export const mapProfileToOperator = (profile: any, promotionPrice: number | null): Operator => {
  // ULTIMATE FIX: Deep clone the entire profile object using JSON methods.
  // This is the most aggressive and reliable way to strip any special properties
  // (like getters/setters) that the database driver might add, ensuring we work
  // with a plain, mutable JavaScript object. This definitively prevents the
  // "Cannot set property of #<Object> which has only a getter" error.
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

  return (data || []).map((profile) => mapProfileToOperator(profile, promotionPrice))
}
