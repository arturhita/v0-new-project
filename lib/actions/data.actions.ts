"use server"

import { supabaseAdmin } from "@/lib/supabase/admin"
import type { Operator } from "@/types/operator.types"
import type { Review } from "@/types/review.types"

// Questa funzione mappa i dati grezzi del profilo da Supabase al nostro tipo Operator
export function mapProfileToOperator(profile: any): Operator {
  return {
    id: profile.id,
    user_id: profile.user_id,
    username: profile.username,
    full_name: profile.full_name,
    avatar_url: profile.avatar_url,
    description: profile.description,
    specialties: profile.specialties || [],
    categories: profile.categories || [],
    is_available: profile.is_available,
    average_rating: profile.average_rating || 0,
    total_reviews: profile.total_reviews || 0,
  }
}

export async function getHomepageData() {
  console.log("Recupero dati per la homepage...")
  try {
    // Recupera gli operatori con le migliori valutazioni
    const { data: operatorsData, error: operatorsError } = await supabaseAdmin
      .from("profiles")
      .select(`
        id,
        user_id,
        username,
        full_name,
        avatar_url,
        description,
        specialties,
        categories,
        is_available,
        average_rating,
        total_reviews
      `)
      .eq("role", "operator")
      .order("average_rating", { ascending: false, nulls: "last" })
      .limit(8)

    if (operatorsError) {
      console.error("Errore nel recupero degli operatori:", operatorsError.message)
      throw new Error(`Errore nel recupero degli operatori: ${operatorsError.message}`)
    }

    // Recupera le recensioni recenti
    const { data: reviewsData, error: reviewsError } = await supabaseAdmin
      .from("reviews")
      .select(`
        id,
        rating,
        comment,
        created_at,
        client_id,
        operator_id,
        profiles:client_id (
          username,
          avatar_url
        )
      `)
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(5)

    if (reviewsError) {
      console.error("Errore nel recupero delle recensioni:", reviewsError.message)
      throw new Error(`Errore nel recupero delle recensioni: ${reviewsError.message}`)
    }

    const operators = operatorsData?.map(mapProfileToOperator) || []

    const reviews: Review[] =
      reviewsData?.map((review: any) => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        created_at: review.created_at,
        client_id: review.client_id,
        operator_id: review.operator_id,
        client_username: review.profiles?.username || "Anonimo",
        client_avatar_url: review.profiles?.avatar_url,
      })) || []

    console.log(`Recuperati ${operators.length} operatori e ${reviews.length} recensioni.`)
    return { operators, reviews }
  } catch (error) {
    console.error("Impossibile ottenere i dati della homepage:", error)
    return { operators: [], reviews: [] }
  }
}

export async function getAllOperators() {
  const { data, error } = await supabaseAdmin.from("profiles").select("*").eq("role", "operator")

  if (error) {
    console.error("Error fetching all operators:", error)
    return []
  }
  return data.map(mapProfileToOperator)
}

export async function getOperatorsByCategory(category: string) {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("role", "operator")
    .contains("categories", [category])

  if (error) {
    console.error(`Error fetching operators for category ${category}:`, error)
    return []
  }
  return data.map(mapProfileToOperator)
}
