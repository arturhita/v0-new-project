"use server"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export async function getAnalyticsData() {
  const supabase = createSupabaseServerClient()
  const { data: kpis, error: kpisError } = await supabase.rpc("get_admin_kpis")
  if (kpisError) {
    console.error("Error fetching KPIs:", kpisError)
    return { kpis: null, recentActivities: null, error: kpisError.message }
  }

  const { data: recentActivities, error: activityError } = await supabase
    .from("audit_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10)

  if (activityError) {
    console.error("Error fetching recent activities:", activityError)
    // Non bloccare tutto se solo le attività recenti falliscono
  }

  return { kpis: kpis?.[0] || {}, recentActivities, error: null }
}
