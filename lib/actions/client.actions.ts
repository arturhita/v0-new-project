"use server"
import createServerClient from "@/lib/supabase/server"

export async function getClientDashboardStats() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase.rpc("get_client_dashboard_stats", { p_client_id: user.id })
  if (error) {
    console.error("Error fetching client dashboard stats:", error)
    return null
  }
  return data
}

export async function getFavoriteExperts() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase.rpc("get_client_favorites", { p_client_id: user.id })
  if (error) {
    console.error("Error fetching favorite experts:", error)
    return []
  }
  return data
}
