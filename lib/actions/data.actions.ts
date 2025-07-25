"use server"

import { createClient } from "@/lib/supabase/server"

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
        is_available
      `)
      .eq("role", "operator")
      .eq("status", "approved")
      .eq("is_available", true)
      .limit(8)

    if (operatorsError) {
      console.error("Error fetching operators:", operatorsError)
      return {
        operators: [],
        categories: [],
        stats: { totalOperators: 0, totalConsultations: 0, averageRating: 0 },
      }
    }

    // Process operators data safely
    const processedOperators = (operators || []).map((operator) => {
      let categories = []
      let specialties = []
      let services = []

      // Safely parse categories
      try {
        if (typeof operator.categories === "string") {
          categories = JSON.parse(operator.categories)
        } else if (Array.isArray(operator.categories)) {
          categories = operator.categories
        }
      } catch (e) {
        console.warn(`Failed to parse categories for operator ${operator.id}:`, e)
        categories = []
      }

      // Safely parse specialties
      try {
        if (typeof operator.specialties === "string") {
          specialties = JSON.parse(operator.specialties)
        } else if (Array.isArray(operator.specialties)) {
          specialties = operator.specialties
        }
      } catch (e) {
        console.warn(`Failed to parse specialties for operator ${operator.id}:`, e)
        specialties = []
      }

      // Safely parse services
      try {
        if (typeof operator.services === "string") {
          services = JSON.parse(operator.services)
        } else if (Array.isArray(operator.services)) {
          services = operator.services
        } else if (operator.services && typeof operator.services === "object") {
          services = operator.services
        }
      } catch (e) {
        console.warn(`Failed to parse services for operator ${operator.id}:`, e)
        services = { chat: false, call: false, video: false }
      }

      return {
        id: operator.id,
        name: operator.full_name || "Nome non disponibile",
        bio: operator.bio || "Descrizione non disponibile",
        avatar: operator.avatar_url || "/placeholder.svg?height=100&width=100",
        rating: operator.rating || 0,
        totalReviews: operator.total_reviews || 0,
        pricePerMinute: operator.price_per_minute || 0,
        categories: Array.isArray(categories) ? categories : [],
        specialties: Array.isArray(specialties) ? specialties : [],
        services: services || { chat: false, call: false, video: false },
        isOnline: operator.is_online || false,
        isAvailable: operator.is_available || false,
      }
    })

    // Get unique categories
    const allCategories = new Set()
    processedOperators.forEach((operator) => {
      if (Array.isArray(operator.categories)) {
        operator.categories.forEach((cat) => allCategories.add(cat))
      }
    })

    // Get platform stats
    const { data: statsData } = await supabase
      .from("profiles")
      .select("id, rating")
      .eq("role", "operator")
      .eq("status", "approved")

    const totalOperators = statsData?.length || 0
    const averageRating =
      statsData?.length > 0 ? statsData.reduce((sum, op) => sum + (op.rating || 0), 0) / statsData.length : 0

    return {
      operators: processedOperators,
      categories: Array.from(allCategories),
      stats: {
        totalOperators,
        totalConsultations: 1250, // This could be fetched from a consultations table
        averageRating: Math.round(averageRating * 10) / 10,
      },
    }
  } catch (error) {
    console.error("Error in getHomepageData:", error)
    return {
      operators: [],
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
        is_available
      `)
      .eq("role", "operator")
      .eq("status", "approved")

    if (error) {
      console.error("Error fetching all operators:", error)
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
    }))
  } catch (error) {
    console.error("Error in getAllOperators:", error)
    return []
  }
}

export async function getOperatorsByCategory(category: string) {
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
        is_available
      `)
      .eq("role", "operator")
      .eq("status", "approved")
      .ilike("categories", `%${category}%`)

    if (error) {
      console.error("Error fetching operators by category:", error)
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
    }))
  } catch (error) {
    console.error("Error in getOperatorsByCategory:", error)
    return []
  }
}

// Helper function to safely parse JSON
function safeParseJSON(value: any, fallback: any) {
  if (!value) return fallback

  if (typeof value === "string") {
    try {
      return JSON.parse(value)
    } catch (e) {
      console.warn("Failed to parse JSON:", value)
      return fallback
    }
  }

  if (Array.isArray(value) || typeof value === "object") {
    return value
  }

  return fallback
}
