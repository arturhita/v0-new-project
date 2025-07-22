"use server"
import { createClient } from "@/lib/supabase/server"
import type { Operator } from "@/types/operator.types"

export async function getHomepageData() {
  const supabase = createClient()
  const { data: operators, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "operator")
    .eq("status", "active")
    .limit(10)

  if (error) {
    console.error("Error fetching homepage data:", error)
    return { operators: [] }
  }
  return { operators: (operators as Operator[]) || [] }
}

export function mapProfileToOperator(profile: any): Operator {
  return {
    id: profile.id,
    full_name: profile.full_name,
    avatar_url: profile.avatar_url,
    bio: profile.bio,
    specialties: profile.specialties || [],
    status: profile.status,
    // Add other fields as necessary
  }
}

export async function getAllOperators(): Promise<Operator[]> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc("get_operators_with_reviews")

  if (error) {
    console.error("Error fetching all operators:", error)
    return []
  }
  return data || []
}

export async function getOperatorsByCategory(category: string): Promise<Operator[]> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc("get_operators_by_category_with_reviews", { category_name: category })

  if (error) {
    console.error(`Error fetching operators for category ${category}:`, error)
    return []
  }
  return data || []
}
