"use server"

import { createClient } from "@/lib/supabase/server"

export async function getAdminDashboardStats() {
  const supabase = createClient()
  const { data, error } = await supabase.rpc("get_admin_dashboard_stats")

  if (error) {
    console.error("Error fetching admin dashboard stats:", error)
    return {
      total_users: 0,
      total_operators: 0,
      pending_operators: 0,
      total_revenue: 0,
      monthly_revenue: 0,
    }
  }

  // The RPC function returns an array with a single object
  return data[0]
}
