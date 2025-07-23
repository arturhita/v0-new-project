"use server"

import { createClient } from "@/lib/supabase/server"
import type { Operator } from "@/components/operator-card"

export const mapProfileToOperator = (profile: any, promotionPrice: number | null): Operator => {
  // The definitive fix: clone the nested services object immediately.
  const rawServices = structuredClone(profile.services || {})
  const chatService = rawServices.chat || {}
  const callService = rawServices.call || {}
  const emailService = rawServices.email || {}

  const chatPrice =
    promotionPrice !== null ? promotionPrice : chatService.enabled ? chatService.price_per_minute : undefined
  const callPrice =
    promotionPrice !== null ? promotionPrice : callService.enabled ? callService.price_per_minute : undefined
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
  console.log("Fetching homepage data...")
  const supabase = createClient()

  try {
    const { data: promotionData, error: promotionError } = await supabase
      .from("promotions")
      .select("price_per_minute")
      .eq("is_active", true)
      .eq("type", "first_consultation")
      .single()

    if (promotionError && promotionError.code !== "PGRST116") {
      // PGRST116 means no rows found, which is not a critical error here.
      console.error("Error fetching promotion:", promotionError)
    }
    const promotionPrice = promotionData?.price_per_minute || null

    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles")
      .select(
        `
        id,
        stage_name,
        avatar_url,
        specialties,
        categories,
        average_rating,
        reviews_count,
        bio,
        is_online,
        services,
        created_at
      `,
      )
      .eq("role", "operator")
      .eq("application_status", "approved")
      .order("is_online", { ascending: false })
      .order("average_rating", { ascending: false, nulls: "last" })
      .limit(8)

    if (profilesError) {
      console.error("Error fetching operator profiles:", profilesError)
      throw new Error("Could not fetch operator profiles.")
    }

    // Deep clone the data immediately after fetching to prevent read-only errors.
    const cleanProfilesData = structuredClone(profilesData)
    const operators = cleanProfilesData.map((profile) => mapProfileToOperator(profile, promotionPrice))

    const { data: reviewsData, error: reviewsError } = await supabase
      .from("reviews")
      .select(
        `
        id,
        rating,
        comment,
        created_at,
        client:profiles!client_id (
          stage_name,
          avatar_url
        ),
        operator:profiles!operator_id (
          stage_name
        )
      `,
      )
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(3)

    if (reviewsError) {
      console.error("Error fetching reviews:", reviewsError)
      throw new Error("Could not fetch reviews.")
    }

    const cleanReviewsData = structuredClone(reviewsData)
    const reviews = cleanReviewsData.map((review: any) => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      author: review.client?.stage_name || "Utente",
      authorAvatar: review.client?.avatar_url || "/placeholder.svg",
      operatorName: review.operator?.stage_name || "Operatore",
      date: new Date(review.created_at).toLocaleDateString("it-IT"),
    }))

    console.log("Successfully fetched homepage data.")
    return { operators, reviews }
  } catch (error: any) {
    console.error("An unexpected error occurred in getHomepageData:", error)
    // Re-throw the original error to be caught by the client component
    throw error
  }
}

export async function getOperatorsByCategory(category: string) {
  const supabase = createClient()
  const { data, error } = await supabase.rpc("get_operators_by_category_case_insensitive", {
    category_name: category,
  })

  if (error) {
    console.error("Error fetching operators by category:", error)
    throw new Error("Could not fetch operators for this category.")
  }

  const cleanData = structuredClone(data)
  return cleanData.map((profile: any) => mapProfileToOperator(profile, null))
}

export async function getAllOperators() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "operator")
    .eq("application_status", "approved")

  if (error) {
    console.error("Error fetching all operators:", error)
    throw new Error("Could not fetch all operators.")
  }

  const cleanData = structuredClone(data)
  return cleanData.map((profile: any) => mapProfileToOperator(profile, null))
}
