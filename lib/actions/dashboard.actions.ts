"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { unstable_noStore as noStore } from "next/cache"

export async function getAdminDashboardStats() {
  noStore()
  const supabase = createAdminClient()
  const { data, error } = await supabase.rpc("get_admin_dashboard_stats")

  if (error) {
    console.error("Error fetching admin dashboard stats:", error)
    return {
      total_users: 0,
      total_operators: 0,
      pending_operators: 0,
      total_revenue: 0,
      monthly_revenue: 0,
      error: "Impossibile caricare le statistiche.",
    }
  }

  // The RPC function returns a single object in an array
  return data[0]
}
