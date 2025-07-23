"use server"
import { createAdminClient } from "@/lib/supabase/admin"
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
  const supabase = createAdminClient()
  try {
    const [operatorsResult, reviewsResult, articlesResult] = await Promise.all([
      supabase
        .from("profiles")
        .select("*, services:operator_services(*)")
        .eq("role", "operator")
        .eq("status", "Attivo")
        .limit(8),
      supabase
        .from("reviews")
        .select(
          `
            id, rating, comment, created_at, service_type,
            client:profiles!reviews_client_id_fkey (name, avatar_url),
            operator:profiles!reviews_operator_id_fkey (stage_name)
          `,
        )
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(3),
      supabase.from("blog_posts").select("*").order("created_at", { ascending: false }).limit(3),
    ])

    const { data: operators, error: operatorError } = operatorsResult
    const { data: reviewsData, error: reviewError } = reviewsResult
    const { data: articles, error: articleError } = articlesResult

    if (operatorError) console.error("Error fetching operators:", operatorError)
    if (reviewError) console.error("Error fetching reviews:", reviewError)
    if (articleError) console.error("Error fetching articles:", articleError)

    if (operatorError || reviewError || articleError) {
      console.error("Error fetching homepage data:", operatorError || reviewError || articleError)
      // Return empty arrays on error
      return { operators: [], reviews: [], articles: [] }
    }

    const mappedOperators = (operators || []).map(mapProfileToOperator)

    const mappedReviews = (reviewsData || []).map(
      (review: any) =>
        ({
          id: review.id,
          user_name: review.client?.name || "Utente Anonimo",
          user_avatar_url: review.client?.avatar_url,
          operator_name: review.operator?.stage_name || "Operatore",
          rating: review.rating,
          comment: review.comment,
          created_at: review.created_at,
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
  const supabase = createAdminClient()
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*, services:operator_services(*)")
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
