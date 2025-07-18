"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { unstable_noStore as noStore } from "next/cache"

export async function getDashboardStats() {
  noStore()
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase.rpc("get_admin_dashboard_stats")

  if (error) {
    console.error("Error fetching dashboard stats:", error)
    return {
      error: "Impossibile caricare le statistiche della dashboard.",
      data: { total_users: 0, total_operators: 0, total_revenue: 0, total_consultations: 0 },
    }
  }

  return { data: data[0], error: null }
}
