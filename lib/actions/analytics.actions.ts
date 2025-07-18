"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { unstable_noStore as noStore } from "next/cache"

export async function getDashboardStats() {
  noStore()
  const supabase = createAdminClient()
  const { data, error } = await supabase.rpc("get_admin_dashboard_stats")

  if (error) {
    console.error("Error fetching dashboard stats:", error)
    return {
      error: "Impossibile recuperare le statistiche.",
      data: {
        totalUsers: 0,
        totalOperators: 0,
        totalRevenue: 0,
        totalConsultations: 0,
      },
    }
  }

  // The RPC returns an array with a single object
  const stats = data && data.length > 0 ? data[0] : null

  return {
    data: {
      totalUsers: stats?.total_users ?? 0,
      totalOperators: stats?.total_operators ?? 0,
      totalRevenue: stats?.total_revenue ?? 0,
      totalConsultations: stats?.total_consultations ?? 0,
    },
  }
}
