"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { unstable_noStore as noStore } from "next/cache"

export async function getFeaturedOperators() {
  noStore()
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase.rpc("get_featured_operators")

  if (error) {
    console.error("Error fetching featured operators:", error)
    return []
  }
  return data
}

export async function getCategories() {
  noStore()
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase.from("categories").select("name, slug, description")

  if (error) {
    console.error("Error fetching categories:", error)
    return []
  }
  return data
}

export async function getOperatorsByCategory(categorySlug: string) {
  noStore()
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase.rpc("get_operators_by_category_slug", {
    p_category_slug: categorySlug,
  })

  if (error) {
    console.error(`Error fetching operators for category ${categorySlug}:`, error)
    return []
  }
  return data
}

export async function searchOperators(query: string) {
  noStore()
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase.rpc("search_operators_unaccent", {
    p_search_term: query,
  })

  if (error) {
    console.error("Error searching operators:", error)
    return []
  }
  return data
}

export async function getOperatorByUsername(username: string) {
  noStore()
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase
    .from("profiles")
    .select(`
            *,
            operator_details(*),
            reviews(
                *,
                client:profiles(full_name, avatar_url)
            )
        `)
    .eq("username", username)
    .eq("reviews.status", "approved")
    .single()

  if (error) {
    console.error(`Error fetching operator ${username}:`, error)
    return null
  }
  return data
}
