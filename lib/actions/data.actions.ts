"use server"
import createServerClient from "@/lib/supabase/server"
import type { Operator } from "@/types/operator.types"

export async function getHomepageData() {
  const supabase = await createServerClient()
  const { data: operators, error } = await supabase.rpc("get_featured_operators")
  if (error) {
    console.error("Error fetching homepage data:", error)
    return { operators: [] }
  }
  return { operators }
}

export function mapProfileToOperator(profile: any): Operator {
  return {
    id: profile.id,
    fullName: profile.full_name,
    specialties: profile.specialties || [],
    profileImage: profile.profile_image_url,
    isAvailable: profile.is_available,
    averageRating: profile.average_rating || 0,
    totalReviews: profile.total_reviews || 0,
    bio: profile.bio,
    operator_name: profile.operator_name,
  }
}

export async function getAllOperators(): Promise<Operator[]> {
  const supabase = await createServerClient()
  const { data, error } = await supabase.rpc("get_all_operators_with_details")
  if (error) {
    console.error("Error fetching all operators:", error)
    return []
  }
  return data.map(mapProfileToOperator)
}

export async function getOperatorsByCategory(category: string): Promise<Operator[]> {
  const supabase = await createServerClient()
  const { data, error } = await supabase.rpc("get_operators_by_category_unaccented", { category_name: category })
  if (error) {
    console.error("Error fetching operators by category:", error)
    return []
  }
  return data.map(mapProfileToOperator)
}
