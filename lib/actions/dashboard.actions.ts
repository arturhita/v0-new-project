"use server"

import { createClient } from "@/lib/supabase/server"
import { unstable_noStore as noStore } from "next/cache"

export async function getAdminDashboardStats() {
  noStore()
  const supabase = createClient()
  const { data, error } = await supabase.rpc("get_admin_dashboard_stats")

  if (error) {
    console.error("Error fetching admin dashboard stats:", error)
    return {
      error: "Impossibile recuperare le statistiche.",
      stats: null,
    }
  }

  return {
    error: null,
    stats: data && data.length > 0 ? data[0] : null,
  }
}
