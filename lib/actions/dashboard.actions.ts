"use server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import createServerClient from "@/lib/supabase/server"

export async function getAdminDashboardData() {
  const { data, error } = await supabaseAdmin.rpc("get_admin_dashboard_stats")
  if (error) {
    console.error("Error fetching admin dashboard data:", error)
    return null
  }
  return data
}

export async function getRecentActivities() {
  // This is a placeholder. Implement logic to get recent activities.
  return []
}

export async function getOperatorDashboardData() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("User not found")

  const { data, error } = await supabase.rpc("get_operator_dashboard_stats", { p_operator_id: user.id })
  if (error) {
    console.error("Error fetching operator dashboard data:", error)
    return null
  }
  return data
}
