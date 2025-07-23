"use server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import type { Operator } from "@/components/operator-card"
import type { Review } from "@/components/review-card"
import type { BlogArticle } from "@/lib/blog-data"

export const mapProfileToOperator = (profile: any): Operator => ({
  id: profile.id,
  name: profile.stage_name || "Operatore",
  avatarUrl: profile.avatar_url || "/placeholder.svg",
  specialization:
    (profile.specialties && profile.specialties[0]) || (profile.categories && profile.categories[0]) || "Esperto",
  rating: profile.average_rating || 0,
  reviewsCount: profile.reviews_count || 0,
  description: profile.bio || "Nessuna descrizione disponibile.",
  tags: profile.categories || [],
  isOnline: profile.is_online || false,
  services: {
    chatPrice: profile.services?.chat?.price_per_minute,
    callPrice: profile.services?.call?.price_per_minute,
    emailPrice: profile.services?.email?.price,
  },
  profileLink: `/operator/${profile.stage_name}`,
  joinedDate: profile.created_at,
})

export async function getHomepageData(): Promise<{
  operators: Operator[]
  reviews: Review[]
  articles: BlogArticle[]
}> {
  try {
    const [operatorsResult, reviewsResult, articlesResult] = await Promise.all([
      supabaseAdmin.from("profiles").select("*").eq("role", "operator").eq("status", "Attivo").limit(8),
      supabaseAdmin
        .from("reviews")
        .select(
          `
            id, rating, comment, created_at, service_type,
            user_name, user_avatar,
            operator:profiles!operator_id (stage_name)
          `,
        )
        .eq("status", "Approved")
        .order("created_at", { ascending: false })
        .limit(3),
      supabaseAdmin.from("blog_posts").select("*").order("created_at", { ascending: false }).limit(3),
    ])

    const { data: operators, error: operatorError } = operatorsResult
    const { data: reviewsData, error: reviewError } = reviewsResult
    const { data: articles, error: articleError } = articlesResult

    if (operatorError || reviewError || articleError) {
      console.error("Error fetching homepage data:", operatorError || reviewError || articleError)
      return { operators: [], reviews: [], articles: [] }
    }

    const mappedOperators = (operators || []).map(mapProfileToOperator)

    const mappedReviews = (reviewsData || []).map(
      (review: any) =>
        ({
          id: review.id,
          rating: review.rating,
          comment: review.comment,
          created_at: review.created_at,
          user_name: review.user_name || "Utente Anonimo",
          user_avatar_url: review.user_avatar || null,
          service_type: review.service_type,
        }) as Review,
    )

    return {
      operators: mappedOperators,
      reviews: mappedReviews,
      articles: (articles || []) as BlogArticle[],
    }
  } catch (error) {
    console.error("General error in getHomepageData:", error)
    return { operators: [], reviews: [], articles: [] }
  }
}

export async function getLatestOperators(): Promise<Operator[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("role", "operator")
      .eq("status", "Attivo")
      .order("created_at", { ascending: false })
      .limit(4)

    if (error) {
      console.error("Error fetching latest operators:", error)
      return []
    }
    return (data || []).map(mapProfileToOperator)
  } catch (error) {
    console.error("General error in getLatestOperators:", error)
    return []
  }
}
