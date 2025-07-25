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
  joinedDate?: string
}

export interface Review {
  id: string
  user_name: string
  user_type: string
  operator_name: string
  rating: number
  comment: string
  created_at: string
}

// Funzione di supporto per mappare un profilo Supabase al tipo di dati atteso dal componente OperatorCard
const mapProfileToOperator = (profile: any): Operator => {
  try {
    let services = { chatPrice: undefined, callPrice: undefined, emailPrice: undefined }

    // Safely parse services if it exists
    if (profile.services) {
      try {
        const parsedServices = typeof profile.services === "string" ? JSON.parse(profile.services) : profile.services

        if (parsedServices && typeof parsedServices === "object") {
          const chatService = parsedServices.chat || {}
          const callService = parsedServices.call || {}
          const emailService = parsedServices.email || {}

          services = {
            chatPrice: chatService.enabled ? chatService.price_per_minute : undefined,
            callPrice: callService.enabled ? callService.price_per_minute : undefined,
            emailPrice: emailService.enabled ? emailService.price : undefined,
          }
        }
      } catch (e) {
        console.warn("Error parsing services for operator:", profile.id, e)
      }
    }

    // Safely parse arrays
    let categories: string[] = []
    let specialties: string[] = []

    if (profile.categories) {
      try {
        categories = Array.isArray(profile.categories)
          ? profile.categories
          : typeof profile.categories === "string"
            ? JSON.parse(profile.categories)
            : []
      } catch (e) {
        categories = []
      }
    }

    if (profile.specialties) {
      try {
        specialties = Array.isArray(profile.specialties)
          ? profile.specialties
          : typeof profile.specialties === "string"
            ? JSON.parse(profile.specialties)
            : []
      } catch (e) {
        specialties = []
      }
    }

    return {
      id: profile.id || "",
      name: profile.stage_name || profile.full_name || "Operatore",
      avatarUrl: profile.avatar_url || "/placeholder.svg?height=100&width=100",
      specialization: specialties[0] || categories[0] || "Esperto",
      rating: Number(profile.average_rating) || 0,
      reviewsCount: Number(profile.reviews_count) || 0,
      description: profile.bio || "Nessuna descrizione disponibile.",
      tags: [...categories, ...specialties].filter(Boolean),
      isOnline: Boolean(profile.is_online),
      services,
      profileLink: `/operator/${profile.stage_name || profile.id}`,
      joinedDate: profile.created_at,
    }
  } catch (error) {
    console.error("Error mapping profile to operator:", error)
    return {
      id: profile.id || "",
      name: "Operatore",
      avatarUrl: "/placeholder.svg?height=100&width=100",
      specialization: "Esperto",
      rating: 0,
      reviewsCount: 0,
      description: "Nessuna descrizione disponibile.",
      tags: [],
      isOnline: false,
      services: {},
      profileLink: `/operator/${profile.id}`,
      joinedDate: profile.created_at,
    }
  }
}

/**
 * Recupera tutti i dati necessari per la homepage (operatori e recensioni).
 */
export async function getHomepageData(): Promise<{ operators: Operator[]; reviews: Review[] }> {
  try {
    const supabase = createClient()

    // Recupera operatori con query semplificata
    const { data: operatorsData, error: operatorsError } = await supabase
      .from("profiles")
      .select(`
        id,
        full_name,
        stage_name,
        avatar_url,
        bio,
        specialties,
        categories,
        average_rating,
        reviews_count,
        is_online,
        services,
        created_at,
        role,
        status
      `)
      .eq("role", "operator")
      .eq("status", "Attivo")
      .order("is_online", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(8)

    if (operatorsError) {
      console.error("Error fetching homepage operators:", operatorsError)
      return { operators: [], reviews: [] }
    }

    const operators = (operatorsData || []).map(mapProfileToOperator)

    // Recupera recensioni con query semplificata
    const { data: reviewsData, error: reviewsError } = await supabase
      .from("reviews")
      .select(`
        id, 
        rating, 
        comment, 
        created_at,
        client_id,
        operator_id
      `)
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(3)

    if (reviewsError) {
      console.error("Error fetching recent reviews:", reviewsError)
      return { operators, reviews: [] }
    }

    // Recupera i nomi degli utenti per le recensioni
    const reviews: Review[] = []

    if (reviewsData && reviewsData.length > 0) {
      for (const review of reviewsData) {
        try {
          // Recupera il nome del cliente
          const { data: clientData } = await supabase
            .from("profiles")
            .select("full_name, avatar_url")
            .eq("id", review.client_id)
            .single()

          // Recupera il nome dell'operatore
          const { data: operatorData } = await supabase
            .from("profiles")
            .select("stage_name, full_name")
            .eq("id", review.operator_id)
            .single()

          reviews.push({
            id: review.id,
            user_name: clientData?.full_name || "Utente Anonimo",
            user_type: "Utente",
            operator_name: operatorData?.stage_name || operatorData?.full_name || "Operatore",
            rating: Number(review.rating) || 0,
            comment: review.comment || "",
            created_at: review.created_at,
          })
        } catch (reviewError) {
          console.warn("Error processing review:", review.id, reviewError)
        }
      }
    }

    return { operators, reviews }
  } catch (error) {
    console.error("Unexpected error in getHomepageData:", error)
    return { operators: [], reviews: [] }
  }
}

/**
 * Recupera gli operatori attivi per una specifica categoria.
 * @param categorySlug - Lo slug della categoria (es. 'cartomanzia' o 'medianità').
 */
export async function getOperatorsByCategory(categorySlug: string): Promise<Operator[]> {
  try {
    const supabase = createClient()
    const slug = decodeURIComponent(categorySlug).toLowerCase()

    const { data, error } = await supabase
      .from("profiles")
      .select(`
        id,
        full_name,
        stage_name,
        avatar_url,
        bio,
        specialties,
        categories,
        average_rating,
        reviews_count,
        is_online,
        services,
        created_at,
        role,
        status
      `)
      .eq("role", "operator")
      .eq("status", "Attivo")
      .or(`categories.cs.{${slug}},specialties.cs.{${slug}}`)
      .order("is_online", { ascending: false })
      .order("created_at", { ascending: false })

    if (error) {
      console.error(`Error fetching operators for category ${slug}:`, error.message)
      return []
    }

    return (data || []).map(mapProfileToOperator)
  } catch (error) {
    console.error(`Unexpected error fetching operators for category ${categorySlug}:`, error)
    return []
  }
}

/**
 * Recupera tutti gli operatori attivi.
 */
export async function getAllOperators(): Promise<Operator[]> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("profiles")
      .select(`
        id,
        full_name,
        stage_name,
        avatar_url,
        bio,
        specialties,
        categories,
        average_rating,
        reviews_count,
        is_online,
        services,
        created_at,
        role,
        status
      `)
      .eq("role", "operator")
      .eq("status", "Attivo")
      .order("is_online", { ascending: false })
      .order("created_at", { ascending: false })

    if (error) {
      console.error(`Error fetching all operators:`, error.message)
      return []
    }

    return (data || []).map(mapProfileToOperator)
  } catch (error) {
    console.error(`Unexpected error fetching all operators:`, error)
    return []
  }
}
