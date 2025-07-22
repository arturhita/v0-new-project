"use server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

export async function getAdminDashboardData() {
  const { data, error } = await supabaseAdmin.rpc("get_admin_dashboard_stats")
  if (error) {
    console.error("Error fetching admin dashboard data:", error)
    return null
  }
  return data[0]
}

export async function getRecentActivities() {
  // This is a placeholder function. You would query your audit/log table.
  return [
    { id: 1, description: 'Operator "Jane Doe" was approved.', timestamp: new Date() },
    { id: 2, description: 'New client "John Smith" registered.', timestamp: new Date() },
  ]
}

export async function getOperatorDashboardData() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase.rpc("get_operator_dashboard_stats", { p_operator_id: user.id })

  if (error) {
    console.error("Error fetching operator dashboard data:", error)
    return null
  }
  return data[0]
}
