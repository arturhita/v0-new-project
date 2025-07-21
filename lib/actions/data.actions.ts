"use server"

import { createClient } from "@/lib/supabase/server"
import type { Review } from "@/components/review-card"
import { getCurrentPromotionPrice } from "./promotions.actions"
import { mapProfileToOperator } from "@/lib/utils/operator-mapper"

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
        .select(`
          id, 
          rating, 
          comment, 
          created_at,
          user_id,
          operator_id
        `)
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

    // Fetch user and operator details for reviews separately
    const reviews: Review[] = []
    if (reviewsData && reviewsData.length > 0) {
      for (const review of reviewsData) {
        // Get client details
        const { data: clientData } = await supabase
          .from("profiles")
          .select("full_name, avatar_url")
          .eq("id", review.user_id)
          .single()

        // Get operator details
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
      }
    }

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
