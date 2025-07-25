"use server"

import { createClient } from "@/lib/supabase/server"

// Helper function to safely parse JSON with better error handling
function safeParseJSON(value: any, fallback: any) {
  if (!value) return fallback

  // If it's already an object or array, return it
  if (typeof value === "object" && value !== null) {
    return Array.isArray(value) ? value : fallback
  }

  // If it's a string, try to parse it
  if (typeof value === "string") {
    // Handle empty strings
    if (value.trim() === "") return fallback

    // Handle strings that look like arrays but aren't JSON
    if (value.startsWith("[") && value.endsWith("]")) {
      try {
        const parsed = JSON.parse(value)
        return Array.isArray(parsed) ? parsed : fallback
      } catch (e) {
        console.warn("Failed to parse JSON array:", value, e)
        return fallback
      }
    }

    // Handle strings that look like objects
    if (value.startsWith("{") && value.endsWith("}")) {
      try {
        const parsed = JSON.parse(value)
        return typeof parsed === "object" && parsed !== null ? parsed : fallback
      } catch (e) {
        console.warn("Failed to parse JSON object:", value, e)
        return fallback
      }
    }

    // If it's just a plain string, treat it as a single item array for categories/specialties
    if (typeof fallback === "object" && Array.isArray(fallback)) {
      return [value]
    }
  }

  return fallback
}

export async function getHomepageData() {
  try {
    const supabase = createClient()

    // Fetch featured operators with error handling
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
      console.error("Error fetching operators:", operatorsError)
      return {
        operators: [],
        reviews: [],
        categories: [],
        stats: { totalOperators: 0, totalConsultations: 0, averageRating: 0 },
      }
    }

    // Process operators data safely
    const processedOperators = (operators || []).map((operator) => {
      const categories = safeParseJSON(operator.categories, [])
      const specialties = safeParseJSON(operator.specialties, [])
      const services = safeParseJSON(operator.services, { chat: false, call: false, video: false })

      return {
        id: operator.id,
        name: operator.full_name || "Nome non disponibile",
        bio: operator.bio || "Descrizione non disponibile",
        avatar: operator.avatar_url || "/placeholder.svg?height=100&width=100",
        rating: typeof operator.rating === "number" ? operator.rating : 0,
        totalReviews: typeof operator.total_reviews === "number" ? operator.total_reviews : 0,
        pricePerMinute: typeof operator.price_per_minute === "number" ? operator.price_per_minute : 0,
        categories: Array.isArray(categories) ? categories : [],
        specialties: Array.isArray(specialties) ? specialties : [],
        services:
          typeof services === "object" && services !== null ? services : { chat: false, call: false, video: false },
        isOnline: Boolean(operator.is_online),
        isAvailable: Boolean(operator.is_available),
        joinedDate: operator.created_at,
      }
    })

    // Fetch recent reviews with error handling
    const { data: reviews, error: reviewsError } = await supabase
      .from("reviews")
      .select(`
        id,
        rating,
        comment,
        created_at,
        client_id,
        operator_id,
        profiles!reviews_client_id_fkey(full_name),
        profiles!reviews_operator_id_fkey(full_name)
      `)
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(6)

    const processedReviews = (reviews || []).map((review) => ({
      id: review.id,
      rating: typeof review.rating === "number" ? review.rating : 5,
      comment: review.comment || "Ottima esperienza!",
      clientName: review.profiles?.full_name || "Cliente",
      operatorName: review.profiles?.full_name || "Operatore",
      date: review.created_at,
    }))

    // Get unique categories from processed operators
    const allCategories = new Set<string>()
    processedOperators.forEach((operator) => {
      if (Array.isArray(operator.categories)) {
        operator.categories.forEach((cat) => {
          if (typeof cat === "string" && cat.trim()) {
            allCategories.add(cat.trim())
          }
        })
      }
    })

    // Get platform stats with error handling
    const { data: statsData, error: statsError } = await supabase
      .from("profiles")
      .select("id, rating, total_reviews")
      .eq("role", "operator")
      .eq("status", "approved")

    let totalOperators = 0
    let averageRating = 0
    let totalConsultations = 0

    if (!statsError && statsData) {
      totalOperators = statsData.length
      const validRatings = statsData.filter((op) => typeof op.rating === "number" && op.rating > 0)
      if (validRatings.length > 0) {
        averageRating = validRatings.reduce((sum, op) => sum + op.rating, 0) / validRatings.length
      }
      totalConsultations = statsData.reduce((sum, op) => sum + (op.total_reviews || 0), 0)
    }

    return {
      operators: processedOperators,
      reviews: processedReviews,
      categories: Array.from(allCategories),
      stats: {
        totalOperators,
        totalConsultations: totalConsultations || 1250, // Fallback number
        averageRating: Math.round(averageRating * 10) / 10,
      },
    }
  } catch (error) {
    console.error("Error in getHomepageData:", error)
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
      .order("rating", { ascending: false })

    if (error) {
      console.error("Error fetching all operators:", error)
      return []
    }

    return (operators || []).map((operator) => ({
      id: operator.id,
      name: operator.full_name || "Nome non disponibile",
      bio: operator.bio || "Descrizione non disponibile",
      avatar: operator.avatar_url || "/placeholder.svg?height=100&width=100",
      rating: typeof operator.rating === "number" ? operator.rating : 0,
      totalReviews: typeof operator.total_reviews === "number" ? operator.total_reviews : 0,
      pricePerMinute: typeof operator.price_per_minute === "number" ? operator.price_per_minute : 0,
      categories: safeParseJSON(operator.categories, []),
      specialties: safeParseJSON(operator.specialties, []),
      services: safeParseJSON(operator.services, { chat: false, call: false, video: false }),
      isOnline: Boolean(operator.is_online),
      isAvailable: Boolean(operator.is_available),
      joinedDate: operator.created_at,
    }))
  } catch (error) {
    console.error("Error in getAllOperators:", error)
    return []
  }
}

export async function getOperatorsByCategory(category: string) {
  try {
    const supabase = createClient()

    // Use a more flexible search that handles both JSON arrays and plain text
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
      .or(`categories.ilike.%${category}%,categories.cs.["${category}"]`)
      .order("rating", { ascending: false })

    if (error) {
      console.error("Error fetching operators by category:", error)
      return []
    }

    return (operators || [])
      .map((operator) => {
        const categories = safeParseJSON(operator.categories, [])

        // Double-check if this operator actually matches the category
        const matchesCategory = Array.isArray(categories)
          ? categories.some((cat) => typeof cat === "string" && cat.toLowerCase().includes(category.toLowerCase()))
          : false

        if (!matchesCategory) return null

        return {
          id: operator.id,
          name: operator.full_name || "Nome non disponibile",
          bio: operator.bio || "Descrizione non disponibile",
          avatar: operator.avatar_url || "/placeholder.svg?height=100&width=100",
          rating: typeof operator.rating === "number" ? operator.rating : 0,
          totalReviews: typeof operator.total_reviews === "number" ? operator.total_reviews : 0,
          pricePerMinute: typeof operator.price_per_minute === "number" ? operator.price_per_minute : 0,
          categories,
          specialties: safeParseJSON(operator.specialties, []),
          services: safeParseJSON(operator.services, { chat: false, call: false, video: false }),
          isOnline: Boolean(operator.is_online),
          isAvailable: Boolean(operator.is_available),
          joinedDate: operator.created_at,
        }
      })
      .filter(Boolean) // Remove null entries
  } catch (error) {
    console.error("Error in getOperatorsByCategory:", error)
    return []
  }
}
