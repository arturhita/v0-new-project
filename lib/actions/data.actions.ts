"use server"
import { createAdminClient } from "@/lib/supabase/admin"

export const mapProfileToOperator = (profile: any) => ({
  id: profile.id,
  name: profile.full_name || "N/A",
  specialties: profile.specialties || [],
  profilePictureUrl: profile.avatar_url || "/placeholder.svg",
  isAvailable: profile.availability_status === "available",
  rating: profile.average_rating || 0,
  reviewsCount: profile.reviews_count || 0,
  description: profile.bio || "Nessuna descrizione disponibile.",
  pricePerMinute: profile.price_per_minute || 0.99,
})

export async function getHomepageData() {
  const supabase = createAdminClient()
  const { data: operators, error: operatorError } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "operator")
    .limit(8)

  const { data: articles, error: articleError } = await supabase
    .from("blog_posts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(3)

  if (operatorError || articleError) {
    console.error("Error fetching homepage data:", operatorError || articleError)
    return { operators: [], articles: [] }
  }

  return {
    operators: operators.map(mapProfileToOperator),
    articles: articles,
  }
}

export async function getLatestOperators() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "operator")
    .order("created_at", { ascending: false })
    .limit(4)

  if (error) {
    console.error("Error fetching latest operators:", error)
    return []
  }
  return data.map(mapProfileToOperator)
}
