"use server"

import { createClient } from "@/lib/supabase/server"

export async function getDashboardStats() {
  const supabase = createClient()
  const { data, error } = await supabase.rpc("get_admin_dashboard_stats")

  if (error || !data || data.length === 0) {
    console.error("Error fetching dashboard stats:", error)
    return {
      totalUsers: 0,
      totalOperators: 0,
      totalRevenue: 0,
      pendingApprovals: 0,
    }
  }

  return data[0]
}
