"use server"
import { createClient } from "@/lib/supabase/server"

export interface OperatorService {
  type: "chat" | "call" | "email"
  price: number | null
}

export interface OperatorProfile {
  id: string
  fullName: string
  avatarUrl: string | null
  headline: string | null
  bio: string | null
  isOnline: boolean
  specializations: string[]
  averageRating: number
  reviewsCount: number
  services: OperatorService[]
  joinedDate: string
}

export async function getApprovedOperators(): Promise<OperatorProfile[]> {
  const supabase = createClient()

  const { data: operatorsData, error } = await supabase
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
      bio: op.bio,
      isOnline: op.is_online,
      specializations: op.specializations || [],
      averageRating: averageRating,
      reviewsCount: totalReviews,
      services: services,
      joinedDate: op.created_at,
    }
  })
}
