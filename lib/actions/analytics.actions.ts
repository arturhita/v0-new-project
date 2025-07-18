"use server"

import { createAdminClient } from "@/lib/supabase/admin"

export async function getAdminDashboardStats() {
  const supabase = createAdminClient()
  const { data, error } = await supabase.rpc("get_admin_dashboard_stats")

  if (error) {
    console.error("Error fetching admin dashboard stats:", error)
    return {
      totalUsers: 0,
      totalOperators: 0,
      totalRevenue: 0,
      totalConsultations: 0,
    }
  }

  return data
}
