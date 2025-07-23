"use server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function getClientDashboardStats() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const adminSupabase = createAdminClient()
  const { data, error } = await adminSupabase.rpc("get_client_dashboard_stats", { p_client_id: user.id }).single()
  if (error) {
    console.error("Error fetching client dashboard stats:", error)
    return null
  }
  return data
}

export async function getFavoriteExperts() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const adminSupabase = createAdminClient()
  const { data, error } = await adminSupabase
    .from("favorites")
    .select("operator:operator_id(id, full_name, avatar_url, availability_status)")
    .eq("user_id", user.id)
  if (error) {
    console.error("Error fetching favorite experts:", error)
    return []
  }
  return data.map((fav: any) => fav.operator)
}
