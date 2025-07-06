"use server"

import { createClient } from "@/lib/supabase/server"
import type { Profile } from "@/contexts/auth-context"

export async function getOperators(options?: {
  limit?: number
  category?: string
}): Promise<Profile[]> {
  const supabase = createClient()
  let query = supabase
    .from("profiles")
    .select(
      `
      id,
      stage_name,
      bio,
      specializations,
      is_available,
      profile_picture_url,
      service_prices,
      average_rating,
      total_reviews
    `,
    )
    .eq("role", "operator")

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  if (options?.category) {
    // Filtra se l'array 'specializations' contiene la categoria specificata
    // La categoria deve essere scritta esattamente come nel DB (es. "Cartomanzia")
    query = query.contains("specializations", [options.category.charAt(0).toUpperCase() + options.category.slice(1)])
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching operators:", error)
    return []
  }

  return data as Profile[]
}

export async function getOperatorByStageName(stageName: string): Promise<Profile | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("stage_name", stageName)
    .eq("role", "operator")
    .single()

  if (error) {
    console.error("Error fetching operator by stage name:", error)
    return null
  }

  return data as Profile
}
