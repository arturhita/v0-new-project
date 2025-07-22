"use server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function getComprehensiveAnalytics() {
  const { data, error } = await supabaseAdmin.rpc("get_comprehensive_analytics")
  if (error) {
    console.error("Error fetching comprehensive analytics:", error)
    return null
  }
  return data
}
