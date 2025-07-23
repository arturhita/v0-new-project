"use server"

import { supabaseAdmin } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

export async function getOperatorDashboardData() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("User not authenticated.")
  }

  const { data, error } = await supabaseAdmin.rpc("get_operator_dashboard_data", {
    operator_id_param: user.id,
  })

  if (error) {
    console.error("Error fetching operator dashboard data:", error)
    throw new Error("Could not fetch dashboard data.")
  }

  // AGGRESSIVE SANITIZATION: This is the most likely place for the error to originate
  // after login, as this data is fetched immediately for the dashboard.
  const cleanData = JSON.parse(JSON.stringify(data || {}))

  return cleanData
}
