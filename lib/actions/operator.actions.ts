"use server"
import { createClient } from "@/lib/supabase/server"
import type { Profile, Review as DbReview, Service } from "@/types/database"

// --- INTERFACCE PUBBLICHE PER I COMPONENTI ---

// Servizio offerto dall'operatore
export interface OperatorService {
  type: "chat" | "call" | "email"
  price: number | null
}

// Recensione con nome dell'autore
export interface PopulatedReview {
  id: string
  rating: number
  comment: string | null
  createdAt: string
  authorName: string
}

// Profilo operatore per la lista/vetrina
export interface OperatorCardProfile {
  id: string
  fullName: string | null
  avatarUrl: string | null
  headline: string | null
  isOnline: boolean
  specializations: string[]
  averageRating: number
  reviewsCount: number
  services: OperatorService[]
  joinedDate: string
}

// Profilo operatore dettagliato per la pagina singola
export interface DetailedOperatorProfile extends OperatorCardProfile {
  bio: string | null
  reviews: PopulatedReview[]
  availability: Record<string, string[]> | null
}

// --- FUNZIONI SERVER ACTION ---

/**
 * Recupera tutti gli operatori approvati e visibili per la vetrina pubblica.
 */
export async function getApprovedOperators(): Promise<OperatorCardProfile[]> {
  const supabase = createClient()

  const { data: operatorsData, error } = await supabase
    .from("profiles")
    .select(
      `
      id,
      full_name,
      avatar_url,
      headline,
      is_online,
      specializations,
      created_at,
      services (
        type,
        price_per_minute,
        price_per_consultation
      ),
      reviews (
        rating
      )
    `,
    )
    .eq("role", "operator")
    .eq("application_status", "approved")
    .eq("is_visible", true)

  if (error) {
    console.error("Error fetching approved operators:", error)
    return []
  }

  return operatorsData.map((op) => {
    const reviews = op.reviews || []
    const totalReviews = reviews.length
    const averageRating = totalReviews > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews : 0

    const services = (op.services || []).map((s) => ({
      type: s.type as "chat" | "call" | "email",
      price: s.price_per_minute ?? s.price_per_consultation,
    }))

    return {
      id: op.id,
      fullName: op.full_name,
      avatarUrl: op.avatar_url,
      headline: op.headline,
      isOnline: op.is_online,
      specializations: op.specializations || [],
      averageRating: Number.parseFloat(averageRating.toFixed(1)),
      reviewsCount: totalReviews,
      services: services,
      joinedDate: op.created_at,
    }
  })
}

/**
 * Recupera i dettagli completi di un singolo operatore tramite il suo ID.
 */
export async function getOperatorById(id: string): Promise<DetailedOperatorProfile | null> {
  const supabase = createClient()

  type OperatorWithDetails = Profile & {
    services: Pick<Service, "type" | "price_per_minute" | "price_per_consultation">[]
    reviews: (Pick<DbReview, "id" | "rating" | "comment" | "created_at"> & {
      profiles: Pick<Profile, "full_name"> | null
    })[]
  }

  const { data, error } = await supabase
    .from("profiles")
    .select(
      `
      id,
      full_name,
      avatar_url,
      headline,
      bio,
      is_online,
      specializations,
      created_at,
      availability,
      services (
        type,
        price_per_minute,
        price_per_consultation
      ),
      reviews!reviews_operator_id_fkey (
        id,
        rating,
        comment,
        created_at,
        profiles!reviews_user_id_fkey (
          full_name
        )
      )
    `,
    )
    .eq("id", id)
    .eq("role", "operator")
    .single<OperatorWithDetails>()

  if (error || !data) {
    console.error(`Error fetching operator with id ${id}:`, error)
    return null
  }

  const reviews = (data.reviews || []).map((r) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.created_at,
    authorName: r.profiles?.full_name || "Utente Anonimo",
  }))

  const totalReviews = reviews.length
  const averageRating = totalReviews > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews : 0

  const services = (data.services || []).map((s) => ({
    type: s.type as "chat" | "call" | "email",
    price: s.price_per_minute ?? s.price_per_consultation,
  }))

  return {
    id: data.id,
    fullName: data.full_name,
    avatarUrl: data.avatar_url,
    headline: data.headline,
    bio: data.bio,
    isOnline: data.is_online,
    specializations: data.specializations || [],
    averageRating: Number.parseFloat(averageRating.toFixed(1)),
    reviewsCount: totalReviews,
    services: services,
    joinedDate: data.created_at,
    reviews: reviews,
    availability: data.availability as Record<string, string[]> | null,
  }
}
