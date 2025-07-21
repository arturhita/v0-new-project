"use server"

import { createClient } from "@/lib/supabase/server"

export interface Operator {
  id: string
  name: string
  avatarUrl: string
  specialization: string
  rating: number
  reviewsCount: number
  description: string
  tags: string[]
  isOnline: boolean
  services: {
    chatPrice?: number
    callPrice?: number
    emailPrice?: number
  }
  profileLink: string
  joinedDate: string
}

export interface Review {
  id: string
  clientName: string
  operatorName: string
  rating: number
  comment: string
  date: string
  service: string
}

export async function getHomepageOperators(): Promise<Operator[]> {
  try {
    const supabase = createClient()

    const { data: profiles, error } = await supabase
      .from("profiles")
      .select(`
        id,
        full_name,
        avatar_url,
        specialization,
        bio,
        tags,
        is_online,
        chat_price,
        call_price,
        email_price,
        created_at,
        reviews!inner(rating)
      `)
      .eq("role", "operator")
      .eq("status", "approved")
      .limit(8)

    if (error) {
      console.error("Error fetching operators:", error)
      return getMockOperators()
    }

    if (!profiles || profiles.length === 0) {
      return getMockOperators()
    }

    return profiles.map((profile) => {
      const reviews = Array.isArray(profile.reviews) ? profile.reviews : []
      const avgRating =
        reviews.length > 0
          ? reviews.reduce((sum: number, review: any) => sum + (review.rating || 0), 0) / reviews.length
          : 4.5

      return {
        id: profile.id,
        name: profile.full_name || "Operatore",
        avatarUrl: profile.avatar_url || "/placeholder.svg?height=64&width=64",
        specialization: profile.specialization || "Consulente Spirituale",
        rating: Math.round(avgRating * 10) / 10,
        reviewsCount: reviews.length,
        description: profile.bio || "Esperto in consulenze spirituali",
        tags: Array.isArray(profile.tags) ? profile.tags : ["Tarocchi", "Astrologia"],
        isOnline: profile.is_online || false,
        services: {
          chatPrice: profile.chat_price,
          callPrice: profile.call_price,
          emailPrice: profile.email_price,
        },
        profileLink: `/operator/${encodeURIComponent(profile.full_name?.toLowerCase().replace(/\s+/g, "-") || profile.id)}`,
        joinedDate: profile.created_at || new Date().toISOString(),
      }
    })
  } catch (error) {
    console.error("Error in getHomepageOperators:", error)
    return getMockOperators()
  }
}

export async function getOperatorsByCategory(category: string): Promise<Operator[]> {
  try {
    const supabase = createClient()

    let query = supabase
      .from("profiles")
      .select(`
        id,
        full_name,
        avatar_url,
        specialization,
        bio,
        tags,
        is_online,
        chat_price,
        call_price,
        email_price,
        created_at,
        reviews!inner(rating)
      `)
      .eq("role", "operator")
      .eq("status", "approved")

    // Filtra per categoria se non è "tutti"
    if (category !== "tutti") {
      const categoryMap: { [key: string]: string[] } = {
        cartomanzia: ["cartomanzia", "tarocchi", "carte"],
        astrologia: ["astrologia", "oroscopo", "stelle"],
        numerologia: ["numerologia", "numeri"],
        medianita: ["medianità", "medium", "spiriti"],
      }

      const searchTerms = categoryMap[category.toLowerCase()] || [category]

      // Cerca nella specializzazione o nei tag
      query = query.or(searchTerms.map((term) => `specialization.ilike.%${term}%,tags.cs.{${term}}`).join(","))
    }

    const { data: profiles, error } = await query

    if (error) {
      console.error("Error fetching operators by category:", error)
      return getMockOperatorsByCategory(category)
    }

    if (!profiles || profiles.length === 0) {
      return getMockOperatorsByCategory(category)
    }

    return profiles.map((profile) => {
      const reviews = Array.isArray(profile.reviews) ? profile.reviews : []
      const avgRating =
        reviews.length > 0
          ? reviews.reduce((sum: number, review: any) => sum + (review.rating || 0), 0) / reviews.length
          : 4.5

      return {
        id: profile.id,
        name: profile.full_name || "Operatore",
        avatarUrl: profile.avatar_url || "/placeholder.svg?height=64&width=64",
        specialization: profile.specialization || "Consulente Spirituale",
        rating: Math.round(avgRating * 10) / 10,
        reviewsCount: reviews.length,
        description: profile.bio || "Esperto in consulenze spirituali",
        tags: Array.isArray(profile.tags) ? profile.tags : ["Tarocchi", "Astrologia"],
        isOnline: profile.is_online || false,
        services: {
          chatPrice: profile.chat_price,
          callPrice: profile.call_price,
          emailPrice: profile.email_price,
        },
        profileLink: `/operator/${encodeURIComponent(profile.full_name?.toLowerCase().replace(/\s+/g, "-") || profile.id)}`,
        joinedDate: profile.created_at || new Date().toISOString(),
      }
    })
  } catch (error) {
    console.error("Error in getOperatorsByCategory:", error)
    return getMockOperatorsByCategory(category)
  }
}

export async function getHomepageReviews(): Promise<Review[]> {
  try {
    const supabase = createClient()

    const { data: reviews, error } = await supabase
      .from("reviews")
      .select(`
        id,
        rating,
        comment,
        created_at,
        service_type,
        profiles!user_id(full_name),
        operator:profiles!operator_id(full_name)
      `)
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(6)

    if (error) {
      console.error("Error fetching reviews:", error)
      return getMockReviews()
    }

    if (!reviews || reviews.length === 0) {
      return getMockReviews()
    }

    return reviews.map((review) => ({
      id: review.id,
      clientName: (review.profiles as any)?.full_name || "Cliente",
      operatorName: (review.operator as any)?.full_name || "Operatore",
      rating: review.rating || 5,
      comment: review.comment || "Esperienza fantastica!",
      date: review.created_at || new Date().toISOString(),
      service: review.service_type || "chat",
    }))
  } catch (error) {
    console.error("Error in getHomepageReviews:", error)
    return getMockReviews()
  }
}

// Dati mock di fallback
function getMockOperators(): Operator[] {
  return [
    {
      id: "1",
      name: "Luna Stellare",
      avatarUrl: "/placeholder.svg?height=64&width=64",
      specialization: "Cartomante Esperta",
      rating: 4.9,
      reviewsCount: 127,
      description: "Specializzata in letture di tarocchi e carte degli angeli. Oltre 10 anni di esperienza.",
      tags: ["Tarocchi", "Angeli", "Amore"],
      isOnline: true,
      services: {
        chatPrice: 1.5,
        callPrice: 2.0,
        emailPrice: 15.0,
      },
      profileLink: "/operator/luna-stellare",
      joinedDate: "2023-01-15T10:00:00Z",
    },
    {
      id: "2",
      name: "Marco Astrologo",
      avatarUrl: "/placeholder.svg?height=64&width=64",
      specialization: "Astrologo Professionista",
      rating: 4.8,
      reviewsCount: 89,
      description: "Carte natali, transiti planetari e previsioni astrologiche personalizzate.",
      tags: ["Astrologia", "Carte Natali", "Previsioni"],
      isOnline: false,
      services: {
        chatPrice: 1.8,
        callPrice: 2.5,
        emailPrice: 25.0,
      },
      profileLink: "/operator/marco-astrologo",
      joinedDate: "2023-02-20T14:30:00Z",
    },
    {
      id: "3",
      name: "Sofia Numerologa",
      avatarUrl: "/placeholder.svg?height=64&width=64",
      specialization: "Numerologa Certificata",
      rating: 4.7,
      reviewsCount: 156,
      description: "Analisi numerologiche complete basate su nome e data di nascita.",
      tags: ["Numerologia", "Destino", "Personalità"],
      isOnline: true,
      services: {
        chatPrice: 1.4,
        callPrice: 1.9,
        emailPrice: 18.0,
      },
      profileLink: "/operator/sofia-numerologa",
      joinedDate: "2023-03-10T09:15:00Z",
    },
    {
      id: "4",
      name: "Elena Medium",
      avatarUrl: "/placeholder.svg?height=64&width=64",
      specialization: "Medium Sensitiva",
      rating: 4.9,
      reviewsCount: 203,
      description: "Comunicazione con il mondo spirituale e messaggi dai propri cari.",
      tags: ["Medianità", "Spiriti", "Messaggi"],
      isOnline: true,
      services: {
        chatPrice: 2.0,
        callPrice: 3.0,
        emailPrice: 30.0,
      },
      profileLink: "/operator/elena-medium",
      joinedDate: "2023-01-05T16:45:00Z",
    },
  ]
}

function getMockOperatorsByCategory(category: string): Operator[] {
  const allOperators = getMockOperators()

  if (category === "tutti") {
    return allOperators
  }

  const categoryFilters: { [key: string]: string[] } = {
    cartomanzia: ["Cartomante", "Tarocchi"],
    astrologia: ["Astrologo", "Astrologia"],
    numerologia: ["Numerologa", "Numerologia"],
    medianita: ["Medium", "Medianità"],
  }

  const filters = categoryFilters[category.toLowerCase()] || []

  return allOperators.filter((operator) =>
    filters.some(
      (filter) => operator.specialization.includes(filter) || operator.tags.some((tag) => tag.includes(filter)),
    ),
  )
}

function getMockReviews(): Review[] {
  return [
    {
      id: "1",
      clientName: "Maria R.",
      operatorName: "Luna Stellare",
      rating: 5,
      comment: "Lettura incredibilmente accurata! Luna ha centrato tutto perfettamente.",
      date: "2024-01-15T10:30:00Z",
      service: "chat",
    },
    {
      id: "2",
      clientName: "Giuseppe T.",
      operatorName: "Marco Astrologo",
      rating: 5,
      comment: "La carta natale è stata molto dettagliata e illuminante.",
      date: "2024-01-14T15:20:00Z",
      service: "email",
    },
    {
      id: "3",
      clientName: "Anna M.",
      operatorName: "Sofia Numerologa",
      rating: 4,
      comment: "Analisi numerologica molto interessante e precisa.",
      date: "2024-01-13T09:45:00Z",
      service: "call",
    },
  ]
}
