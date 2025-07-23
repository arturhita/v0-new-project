"use server"
import { createClient } from "@/lib/supabase/server"
import type { Operator } from "@/types/operator.types"

export async function getHomepageData() {
  const supabase = createClient()
  const { data: operators, error: operatorsError } = await supabase
    .from("profiles")
    .select("id, username, bio, avatar_url, price_per_minute, categories, availability_status, average_rating")
    .eq("role", "operator")
    .eq("status", "approved")
    .limit(6)

  const { data: articles, error: articlesError } = await supabase
    .from("articles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(3)

  if (operatorsError || articlesError) {
    console.error("Error fetching homepage data:", operatorsError || articlesError)
    return { operators: [], articles: [] }
  }

  return { operators: (operators || []).map(mapProfileToOperator), articles: articles || [] }
}

export async function getLatestOperators() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, bio, avatar_url, price_per_minute, categories, availability_status, average_rating")
    .eq("role", "operator")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(10)

  if (error) {
    console.error("Error fetching latest operators:", error)
    return []
  }
  return (data || []).map(mapProfileToOperator)
}

export function mapProfileToOperator(profile: any): Operator {
  return {
    id: profile.id,
    name: profile.username,
    description: profile.bio,
    pricePerMinute: profile.price_per_minute,
    categories: profile.categories || [],
    imageUrl: profile.avatar_url,
    isAvailable: profile.availability_status === "available",
    averageRating: profile.average_rating || 0,
  }
}
