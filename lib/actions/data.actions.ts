"use server"

import { createClient } from "@/lib/supabase/server"
import type { Operator } from "@/components/operator-card"
import type { Review } from "@/components/review-card"

export async function getApprovedOperators(): Promise<Operator[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("operator_profiles")
    .select(
      `
      id,
      is_online,
      tags,
      chat_price_per_minute,
      call_price_per_minute,
      email_price,
      average_rating,
      reviews_count,
      profiles (
        id,
        name,
        avatar_url,
        specialization,
        description,
        created_at
      )
    `,
    )
    .eq("application_status", "approved")
    .limit(8)

  if (error) {
    console.error("Error fetching approved operators:", error)
    return []
  }

  return data.map((o) => {
    const profile = Array.isArray(o.profiles) ? o.profiles[0] : o.profiles
    return {
      id: o.id,
      name: profile?.name || "Operatore",
      avatarUrl: profile?.avatar_url || null,
      specialization: profile?.specialization || "N/A",
      rating: o.average_rating || 0,
      reviewsCount: o.reviews_count || 0,
      description: profile?.description || "Nessuna descrizione.",
      tags: o.tags || [],
      isOnline: o.is_online || false,
      services: {
        chatPrice: o.chat_price_per_minute,
        callPrice: o.call_price_per_minute,
        emailPrice: o.email_price,
      },
      joinedDate: profile?.created_at,
    }
  })
}

export async function getRecentReviews(): Promise<Review[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("reviews")
    .select(
      `
      id,
      created_at,
      rating,
      comment,
      client:client_id ( name, avatar_url ),
      operator:operator_id ( profiles ( name ) )
    `,
    )
    .order("created_at", { ascending: false })
    .limit(10)

  if (error) {
    console.error("Error fetching recent reviews:", error)
    return []
  }

  return data.map((r) => {
    const clientProfile = Array.isArray(r.client) ? r.client[0] : r.client
    const operatorProfile = Array.isArray(r.operator) ? r.operator[0] : r.operator
    const operatorNestedProfile = operatorProfile?.profiles

    return {
      id: r.id,
      date: r.created_at,
      rating: r.rating,
      text: r.comment,
      author: clientProfile?.name || "Utente Anonimo",
      operatorName: operatorNestedProfile?.name || "Operatore",
    }
  })
}
