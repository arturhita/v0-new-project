"use server"

import { createAdminClient } from "@/lib/supabase/admin"

export async function getAnalyticsData() {
  const supabaseAdmin = createAdminClient()

  const { count: totalUsers, error: usersError } = await supabaseAdmin
    .from("profiles")
    .select("*", { count: "exact", head: true })
  if (usersError) console.error("Error fetching total users:", usersError)

  const { count: totalOperators, error: operatorsError } = await supabaseAdmin
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "operator")
  if (operatorsError) console.error("Error fetching total operators:", operatorsError)

  const { data: revenueData, error: revenueError } = await supabaseAdmin.rpc("calculate_total_revenue")
  if (revenueError) console.error("Error fetching total revenue:", revenueError)

  const { data: consultationsData, error: consultationsError } = await supabaseAdmin.rpc("get_monthly_consultations")
  if (consultationsError) console.error("Error fetching monthly consultations:", consultationsError)

  return {
    totalUsers: totalUsers ?? 0,
    totalOperators: totalOperators ?? 0,
    totalRevenue: revenueData ?? 0,
    monthlyConsultations: consultationsData ?? [],
  }
}
