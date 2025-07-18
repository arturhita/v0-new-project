"use server"

import { createServerClient } from "@/lib/supabase/server"
import { unstable_noStore as noStore } from "next/cache"

export async function getAdminDashboardStats() {
  noStore()
  const supabase = createServerClient()

  const { data, error } = await supabase.rpc("get_admin_dashboard_stats")

  if (error) {
    console.error("Error fetching admin dashboard stats:", error.message)
    return {
      total_users: 0,
      total_operators: 0,
      pending_operators: 0,
      total_revenue: 0,
      monthly_revenue: 0,
    }
  }

  return data[0]
}
