"use server"

import { supabaseAdmin } from "@/lib/supabase/admin"
import type { Operator } from "@/components/operator-card"
import type { Review } from "@/components/review-card"
import { getCurrentPromotionPrice } from "./promotions.actions"

export const mapProfileToOperator = (profile: any, promotionPrice: number | null): Operator => {
  // SOLUZIONE DEFINITIVA DI RICOSTRUZIONE MANUALE.
  // Questo metodo è a prova di proiettile contro gli errori "getter-only".
  // Creiamo un oggetto JavaScript pulito da zero.

  const rawServices = profile.services || {}

  // Ricostruiamo manualmente l'oggetto 'services' per garantire che sia modificabile.
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

  // Costruiamo l'oggetto Operator finale con dati puliti.
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

export async function getLatestOperators() {
  const supabase = supabaseAdmin
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
