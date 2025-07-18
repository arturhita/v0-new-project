"use server"

import { createClient } from "@/lib/supabase/server"
import { unstable_noStore as noStore } from "next/cache"

export async function getFeaturedOperators() {
  noStore()
  const supabase = createClient()
  // Use the new, dedicated RPC function for consistency and security
  const { data, error } = await supabase.rpc("get_featured_operators_public")

  if (error) {
    console.error("Error fetching featured operators via RPC:", error.message)
    return []
  }
  return data
}

export async function getOperatorByName(operatorName: string) {
  noStore()
  const supabase = createClient()
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "operator")
    .eq("status", "Attivo")
    .eq("stage_name", operatorName)
    .single()

  if (error) {
    console.error(`Error fetching operator ${operatorName}:`, error)
    return null
  }
  return data
}

export async function getOperatorsByCategory(category: string) {
  noStore()
  const supabase = createClient()
  const { data, error } = await supabase.rpc("get_operators_by_category_case_insensitive", {
    category_slug: category,
  })

  if (error) {
    console.error(`Error fetching operators for category ${category} via RPC:`, error.message)
    return []
  }
  return data
}

export async function getBlogCategories() {
  noStore()
  const supabase = createClient()
  const { data, error } = await supabase.rpc("get_distinct_blog_categories")
  if (error) {
    console.error("Error fetching blog categories:", error)
    return []
  }
  return data.map((item: any) => item.category)
}
