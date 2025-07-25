"use server"

import { createClient } from "@/lib/supabase/server"
import type { Operator } from "@/components/operator-card"
import type { Review } from "@/components/review-card"

// Funzione di supporto per mappare un profilo Supabase al tipo di dati atteso dal componente OperatorCard
const mapProfileToOperator = (profile: any): Operator => {
  const services = (profile.services as any) || {}
  const chatService = services.chat || {}
  const callService = services.call || {}
  const emailService = services.email || {}

  return {
    id: profile.id,
    name: profile.stage_name || profile.full_name || "Operatore",
    avatarUrl: profile.avatar_url || "/placeholder.svg?height=100&width=100",
    specialization:
      (profile.specialties && profile.specialties[0]) || (profile.categories && profile.categories[0]) || "Esperto",
    rating: profile.average_rating || 0,
    reviewsCount: profile.reviews_count || 0,
    description: profile.bio || "Nessuna descrizione disponibile.",
    tags: profile.categories || [],
    isOnline: profile.is_online || false,
    services: {
      chatPrice: chatService.enabled ? chatService.price_per_minute : undefined,
      callPrice: callService.enabled ? callService.price_per_minute : undefined,
      emailPrice: emailService.enabled ? emailService.price : undefined,
    },
    profileLink: `/operator/${profile.stage_name || profile.id}`,
    joinedDate: profile.created_at,
  }
}

/**
 * Recupera tutti i dati necessari per la homepage (operatori e recensioni).
 */
export async function getHomepageData() {
  const supabase = createClient()

  try {
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
          rating: review.rating,
          comment: review.comment,
          created_at: review.created_at,
        })
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
export async function getOperatorsByCategory(categorySlug: string) {
  const supabase = createClient()
  const slug = decodeURIComponent(categorySlug).toLowerCase()

  try {
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
    console.error(`Unexpected error fetching operators for category ${slug}:`, error)
    return []
  }
}

/**
 * Recupera tutti gli operatori attivi.
 */
export async function getAllOperators() {
  const supabase = createClient()

  try {
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
