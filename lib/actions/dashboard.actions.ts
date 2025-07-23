"use server"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

export async function getAdminDashboardData() {
  const supabase = createAdminClient()
  // This is a placeholder for a more complex query
  const { count: usersCount, error: usersError } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
  const { count: operatorsCount, error: operatorsError } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "operator")
  const { data: totalRevenue, error: revenueError } = await supabase.rpc("get_total_revenue")

  return {
    usersCount: usersCount ?? 0,
    operatorsCount: operatorsCount ?? 0,
    totalRevenue: totalRevenue ?? 0,
  }
}

export async function getRecentActivities() {
  const supabase = createAdminClient()
  // Placeholder
  const { data, error } = await supabase
    .from("audit_log_entries")
    .select("*")
    .order("timestamp", { ascending: false })
    .limit(10)
  return data || []
}

export async function getOperatorDashboardData() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const adminSupabase = createAdminClient()
  // Placeholder for a more complex query
  const { data, error } = await adminSupabase.rpc("get_operator_dashboard_summary", { p_operator_id: user.id }).single()

  if (error) {
    console.error("Error fetching operator dashboard data:", error)
    return null
  }
  return data
}
