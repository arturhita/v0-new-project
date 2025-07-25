"use server"

import { createClient } from "@/lib/supabase/server"

// Helper function to safely parse JSON
function safeParseJSON(value: any, fallback: any) {
  if (!value) return fallback

  if (typeof value === "string") {
    try {
      return JSON.parse(value)
    } catch (e) {
      // This can be noisy, so it's commented out, but useful for debugging
      // console.warn("Failed to parse JSON string:", value, e)
      return fallback
    }
  }

  // If it's already an object or array, return it directly
  if (Array.isArray(value) || typeof value === "object") {
    return value
  }

  return fallback
}

export async function getHomepageData() {
  try {
    const supabase = createClient()

    // Fetch featured operators
    const { data: operators, error: operatorsError } = await supabase
      .from("profiles")
      .select(`
        id,
        full_name,
        bio,
        avatar_url,
        rating,
        total_reviews,
        price_per_minute,
        categories,
        specialties,
        services,
        is_online,
        is_available,
        created_at
      `)
      .eq("role", "operator")
      .eq("status", "approved")
      .eq("is_available", true)
      .order("created_at", { ascending: false })
      .limit(8)

    if (operatorsError) {
      console.error("Error fetching operators:", operatorsError.message)
      return {
        operators: [],
        reviews: [],
        categories: [],
        stats: { totalOperators: 0, totalConsultations: 0, averageRating: 0 },
      }
    }

    const processedOperators = (operators || []).map((operator) => ({
      id: operator.id,
      name: operator.full_name || "Nome non disponibile",
      bio: operator.bio || "Descrizione non disponibile",
      avatar: operator.avatar_url || "/placeholder.svg?height=100&width=100",
      rating: operator.rating || 0,
      totalReviews: operator.total_reviews || 0,
      pricePerMinute: operator.price_per_minute || 0,
      categories: safeParseJSON(operator.categories, []),
      specialties: safeParseJSON(operator.specialties, []),
      services: safeParseJSON(operator.services, { chat: false, call: false, video: false }),
      isOnline: operator.is_online || false,
      isAvailable: operator.is_available || false,
      joinedDate: operator.created_at,
    }))

    // Fetch recent reviews
    const { data: reviews, error: reviewsError } = await supabase
      .from("reviews")
      .select(`
        id,
        rating,
        comment,
        created_at,
        profiles ( full_name, avatar_url )
      `)
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(3)

    if (reviewsError) {
      console.error("Error fetching reviews:", reviewsError.message)
    }

    const processedReviews = (reviews || []).map((review) => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      author: review.profiles?.full_name || "Anonimo",
      avatar: review.profiles?.avatar_url || "/placeholder.svg?height=40&width=40",
      date: new Date(review.created_at).toLocaleDateString("it-IT"),
    }))

    // Get unique categories
    const allCategories = new Set<string>()
    processedOperators.forEach((operator) => {
      if (Array.isArray(operator.categories)) {
        operator.categories.forEach((cat) => {
          if (typeof cat === "string") allCategories.add(cat)
        })
      }
    })

    // Get platform stats more efficiently
    const { count: totalOperators } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "operator")
      .eq("status", "approved")

    const { count: totalConsultations } = await supabase
      .from("consultations")
      .select("id", { count: "exact", head: true })

    const { data: ratingData } = await supabase.rpc("get_average_rating")

    return {
      operators: processedOperators,
      reviews: processedReviews,
      categories: Array.from(allCategories),
      stats: {
        totalOperators: totalOperators || 0,
        totalConsultations: totalConsultations || 1250, // Fallback for stats
        averageRating: Math.round((ratingData || 0) * 10) / 10,
      },
    }
  } catch (error: any) {
    console.error("Fatal Error in getHomepageData:", error.message)
    return {
      operators: [],
      reviews: [],
      categories: [],
      stats: { totalOperators: 0, totalConsultations: 0, averageRating: 0 },
    }
  }
}

export async function getAllOperators() {
  try {
    const supabase = createClient()

    const { data: operators, error } = await supabase
      .from("profiles")
      .select(`
        id,
        full_name,
        bio,
        avatar_url,
        rating,
        total_reviews,
        price_per_minute,
        categories,
        specialties,
        services,
        is_online,
        is_available,
        created_at
      `)
      .eq("role", "operator")
      .eq("status", "approved")

    if (error) {
      console.error("Error fetching all operators:", error.message)
      return []
    }

    return (operators || []).map((operator) => ({
      id: operator.id,
      name: operator.full_name || "Nome non disponibile",
      bio: operator.bio || "Descrizione non disponibile",
      avatar: operator.avatar_url || "/placeholder.svg?height=100&width=100",
      rating: operator.rating || 0,
      totalReviews: operator.total_reviews || 0,
      pricePerMinute: operator.price_per_minute || 0,
      categories: safeParseJSON(operator.categories, []),
      specialties: safeParseJSON(operator.specialties, []),
      services: safeParseJSON(operator.services, { chat: false, call: false, video: false }),
      isOnline: operator.is_online || false,
      isAvailable: operator.is_available || false,
      joinedDate: operator.created_at,
    }))
  } catch (error: any) {
    console.error("Error in getAllOperators:", error.message)
    return []
  }
}

export async function getOperatorsByCategory(category: string) {
  try {
    const supabase = createClient()

    // Using the RPC for case-insensitive and accurate search
    const { data: operators, error } = await supabase.rpc("get_operators_by_category_case_insensitive", {
      category_name: category,
    })

    if (error) {
      console.error("Error fetching operators by category:", error.message)
      return []
    }

    return (operators || []).map((operator: any) => ({
      id: operator.id,
      name: operator.full_name || "Nome non disponibile",
      bio: operator.bio || "Descrizione non disponibile",
      avatar: operator.avatar_url || "/placeholder.svg?height=100&width=100",
      rating: operator.rating || 0,
      totalReviews: operator.total_reviews || 0,
      pricePerMinute: operator.price_per_minute || 0,
      categories: safeParseJSON(operator.categories, []),
      specialties: safeParseJSON(operator.specialties, []),
      services: safeParseJSON(operator.services, { chat: false, call: false, video: false }),
      isOnline: operator.is_online || false,
      isAvailable: operator.is_available || false,
      joinedDate: operator.created_at,
    }))
  } catch (error: any) {
    console.error("Error in getOperatorsByCategory:", error.message)
    return []
  }
}
