"use server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function getComprehensiveAnalytics() {
  const supabase = createAdminClient()
  const { data, error } = await supabase.rpc("get_comprehensive_analytics")

  if (error) {
    console.error("Error fetching comprehensive analytics:", error)
    return null
  }
  return data
}
