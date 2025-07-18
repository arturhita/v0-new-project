"use server"

import { createClient } from "@/lib/supabase/server"

export async function getAdminDashboardStats() {
  const supabase = createClient()
  const { data, error } = await supabase.rpc("get_admin_dashboard_stats")

  if (error) {
    console.error("Error fetching admin dashboard stats:", error)
    return {
      totalUsers: 0,
      totalOperators: 0,
      pendingOperators: 0,
      totalRevenue: 0,
      monthlyRevenue: 0,
    }
  }

  return data
}
