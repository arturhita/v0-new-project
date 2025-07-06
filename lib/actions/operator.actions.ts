"use server"

import { createServerClient } from "@/lib/supabase/server"
import type { Operator } from "@/types/operator.types"

export async function getOperators(categorySlug?: string): Promise<Operator[]> {
  const supabase = createServerClient()

  let query = supabase
    .from("profiles")
    .select(`
      id,
      full_name,
      stage_name,
      bio,
      is_available,
      profile_image_url,
      average_rating,
      review_count,
      categories (
        slug,
        name
      )
    `)
    .eq("role", "operator")
    .order("is_available", { ascending: false })
    .order("average_rating", { ascending: false, nulls: "last" })

  if (categorySlug) {
    query = query.in("categories.slug", [categorySlug])
  }

  const { data: operators, error } = await query

  if (error) {
    console.error("Error fetching operators:", error.message)
    throw new Error(`Error fetching operators: ${error.message}`)
  }

  return operators.map((op: any) => ({
    id: op.id,
    fullName: op.full_name,
    stageName: op.stage_name,
    bio: op.bio,
    isAvailable: op.is_available,
    profileImageUrl: op.profile_image_url,
    averageRating: op.average_rating,
    reviewCount: op.review_count,
    categories: op.categories.map((cat: any) => cat.name),
  }))
}

export async function getOperatorByStageName(stageName: string): Promise<Operator | null> {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from("profiles")
    .select(`
      id,
      full_name,
      stage_name,
      bio,
      is_available,
      profile_image_url,
      average_rating,
      review_count,
      categories (
        slug,
        name
      )
    `)
    .eq("role", "operator")
    .eq("stage_name", stageName)
    .single()

  if (error) {
    if (error.code === "PGRST116") {
      // "PGRST116" is the code for "0 rows returned"
      return null
    }
    console.error("Error fetching operator by stage name:", error.message)
    throw new Error(`Error fetching operator: ${error.message}`)
  }

  if (!data) return null

  return {
    id: data.id,
    fullName: data.full_name,
    stageName: data.stage_name,
    bio: data.bio,
    isAvailable: data.is_available,
    profileImageUrl: data.profile_image_url,
    averageRating: data.average_rating,
    reviewCount: data.review_count,
    categories: data.categories.map((cat: any) => cat.name),
  }
}
