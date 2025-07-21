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
  const supabase = createClient()

  try {
    // Get promotion price
    const promotionPrice = await getCurrentPromotionPrice()

    // Fetch operators
    const { data: operatorsData, error: operatorsError } = await supabase
      .from("profiles")
      .select(`*`)
      .eq("role", "operator")
      .eq("status", "Attivo")
      .order("is_online", { ascending: false })
      .limit(8)

    if (operatorsError) {
      console.error("Error fetching homepage operators:", operatorsError)
      throw operatorsError
    }

    // Fetch reviews with proper error handling
    let reviewsData: any[] = []
    try {
      const { data, error: reviewsError } = await supabase
        .from("reviews")
        .select(`
          id, 
          rating, 
          comment, 
          created_at,
          user_id,
          operator_id
        `)
        .eq("status", "approved")
        .not("user_id", "is", null)
        .not("operator_id", "is", null)
        .order("created_at", { ascending: false })
        .limit(3)

      if (reviewsError) {
        console.error("Error fetching reviews:", reviewsError)
        // Don't throw, just log and continue with empty reviews
      } else {
        reviewsData = data || []
      }
    } catch (reviewError) {
      console.error("Reviews fetch failed:", reviewError)
      // Continue with empty reviews array
    }

    const operators = (operatorsData || []).map((profile) => mapProfileToOperator(profile, promotionPrice))

    // Process reviews with additional error handling
    const reviews: Review[] = []
    if (reviewsData && reviewsData.length > 0) {
      for (const review of reviewsData) {
        try {
          // Get client details with fallback
          const { data: clientData } = await supabase
            .from("profiles")
            .select("full_name, avatar_url")
            .eq("id", review.user_id)
            .single()

          // Get operator details with fallback
          const { data: operatorData } = await supabase
            .from("profiles")
            .select("stage_name")
            .eq("id", review.operator_id)
            .single()

          reviews.push({
            id: review.id,
            user_name: clientData?.full_name || "Utente Anonimo",
            user_type: "Utente",
            operator_name: operatorData?.stage_name || "Operatore",
            rating: review.rating,
            comment: review.comment,
            created_at: review.created_at,
          })
        } catch (reviewProcessError) {
          console.error("Error processing individual review:", reviewProcessError)
          // Skip this review and continue
          continue
        }
      }
    }

    return { operators, reviews }
  } catch (error) {
    console.error("A general error occurred while fetching homepage data:", error)
    // Return empty data instead of throwing
    return { operators: [], reviews: [] }
  }
}

export async function getOperatorsByCategory(categorySlug: string) {
  const supabase = createClient()
  const slug = decodeURIComponent(categorySlug)

  try {
    const promotionPrice = await getCurrentPromotionPrice()

    const { data, error } = await supabase.rpc("get_operators_by_category_case_insensitive", {
      category_slug: slug,
    })

    if (error) {
      console.error(`Error fetching operators for category ${slug} via RPC:`, error.message)
      return []
    }

    return (data || []).map((profile) => mapProfileToOperator(profile, promotionPrice))
  } catch (error) {
    console.error(`Error in getOperatorsByCategory:`, error)
    return []
  }
}

export async function getAllOperators() {
  const supabase = createClient()

  try {
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
  } catch (error) {
    console.error(`Error in getAllOperators:`, error)
    return []
  }
}

// Export additional utility functions
export async function getOperatorByName(stageName: string) {
  const supabase = createClient()

  try {
    const promotionPrice = await getCurrentPromotionPrice()

    const { data, error } = await supabase
      .from("profiles")
      .select(`*`)
      .eq("role", "operator")
      .eq("stage_name", stageName)
      .eq("status", "Attivo")
      .single()

    if (error) {
      console.error(`Error fetching operator ${stageName}:`, error.message)
      return null
    }

    return mapProfileToOperator(data, promotionPrice)
  } catch (error) {
    console.error(`Error in getOperatorByName:`, error)
    return null
  }
}

export async function searchOperators(query: string) {
  const supabase = createClient()

  try {
    const promotionPrice = await getCurrentPromotionPrice()

    const { data, error } = await supabase
      .from("profiles")
      .select(`*`)
      .eq("role", "operator")
      .eq("status", "Attivo")
      .or(`stage_name.ilike.%${query}%,bio.ilike.%${query}%,specialties.cs.{${query}},categories.cs.{${query}}`)
      .order("is_online", { ascending: false })

    if (error) {
      console.error(`Error searching operators:`, error.message)
      return []
    }

    return (data || []).map((profile) => mapProfileToOperator(profile, promotionPrice))
  } catch (error) {
    console.error(`Error in searchOperators:`, error)
    return []
  }
}
