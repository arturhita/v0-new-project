"use server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function getComprehensiveAnalytics() {
  const { data, error } = await supabaseAdmin.rpc("get_admin_dashboard_stats")

  if (error) {
    console.error("Error fetching comprehensive analytics:", error)
    return null
  }
  // The RPC function returns an array with one object
  return data && data.length > 0 ? data[0] : null
}
