"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import type { Operator } from "@/components/operator-card"
import type { Review } from "@/components/review-card"
import { getCurrentPromotionPrice } from "./promotions.actions"

export const mapProfileToOperator = (profile: any, promotionPrice: number | null): Operator => {
  const rawServices = profile.services || {}

  const services = {
    chat: {
      enabled: rawServices.chat?.enabled ?? false,
      price_per_minute: rawServices.chat?.price_per_minute,
    },
    call: {
      enabled: rawServices.call?.enabled ?? false,
      price_per_minute: rawServices.call?.price_per_minute,
    },
    email: {
      enabled: rawServices.email?.enabled ?? false,
      price: rawServices.email?.price,
    },
  }

  const chatPrice =
    promotionPrice !== null ? promotionPrice : services.chat.enabled ? services.chat.price_per_minute : undefined
  const callPrice =
    promotionPrice !== null ? promotionPrice : services.call.enabled ? services.call.price_per_minute : undefined
  const emailPrice =
    promotionPrice !== null ? promotionPrice * 6 : services.email.enabled ? services.email.price : undefined

  const operator: Operator = {
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

  return operator
}

export async function getHomepageData() {
  const supabase = createAdminClient()
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
      id, rating, comment, created_at, service_type,
      user_name, user_avatar,
      operator:profiles!operator_id (stage_name)
    `,
        )
        .eq("status", "Approved")
        .order("created_at", { ascending: false })
        .limit(3),
    ])

    const { data: operatorsData, error: operatorsError } = operatorsResult
    const { data: reviewsData, error: reviewsError } = reviewsResult

    if (operatorsError) throw new Error("Database error fetching operators.")
    if (reviewsError) throw new Error("Database error fetching reviews.")

    const operators = (operatorsData || []).map((profile) => mapProfileToOperator(profile, promotionPrice))
    const cleanReviewsData = JSON.parse(JSON.stringify(reviewsData || []))

    const reviews: Review[] = cleanReviewsData.map((review: any) => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      created_at: review.created_at,
      user_name: review.user_name || "Utente Anonimo",
      user_avatar_url: review.user_avatar || null,
      service_type: review.service_type,
    }))

    return { operators, reviews }
  } catch (error) {
    console.error("A general error occurred while fetching homepage data:", error)
    throw error
  }
}

export async function getLatestOperators() {
  const supabase = createAdminClient()
  const promotionPrice = await getCurrentPromotionPrice()

  const { data, error } = await supabase
    .from("profiles")
    .select(`*`)
    .eq("role", "operator")
    .eq("status", "Attivo")
    .order("created_at", { ascending: false })
    .limit(4)

  if (error) {
    console.error(`Error fetching latest operators:`, error.message)
    return []
  }

  return (data || []).map((profile) => mapProfileToOperator(profile, promotionPrice))
}
