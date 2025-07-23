"use server"

import { createClient } from "@/lib/supabase/server"
import { unstable_noStore as noStore } from "next/cache"

export async function getAdminDashboardData() {
  const supabase = createClient()
  noStore()

  const { data: users, error: usersError } = await supabase.rpc("count_users_by_role")
  const { data: revenue, error: revenueError } = await supabase.rpc("get_monthly_revenue")
  const { data: consultations, error: consultationsError } = await supabase.rpc("get_monthly_consultations_count")
  const { data: pendingOperators, error: pendingOperatorsError } = await supabase
    .from("profiles")
    .select("id")
    .eq("status", "pending")
    .eq("role", "operator")

  if (usersError || revenueError || consultationsError || pendingOperatorsError) {
    console.error({ usersError, revenueError, consultationsError, pendingOperatorsError })
  }

  const operatorCount = users?.find((u: any) => u.role === "operator")?.count || 0
  const clientCount = users?.find((u: any) => u.role === "client")?.count || 0

  return {
    operatorCount,
    clientCount,
    totalUsers: operatorCount + clientCount,
    monthlyRevenue: revenue?.[0]?.total_revenue || 0,
    monthlyConsultations: consultations || 0,
    pendingOperatorRequests: pendingOperators?.length || 0,
  }
}

export async function getOperatorDashboardData(operatorId: string) {
  noStore()
  const supabase = createClient()

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("average_rating, reviews_count")
    .eq("id", operatorId)
    .single()

  if (profileError) {
    console.error("Error fetching operator profile for dashboard:", profileError)
    return null
  }

  const { data, error: statsError } = await supabase.rpc("get_operator_dashboard_stats", {
    p_operator_id: operatorId,
  })

  if (statsError) {
    console.error("Error fetching operator dashboard stats:", statsError)
    return null
  }

  if (!data || data.length === 0) {
    return null
  }

  // DEFENSIVE FIX: Sanitize data from RPC calls.
  const sanitizedData = JSON.parse(JSON.stringify(data[0]))

  const cleanProfile = JSON.parse(JSON.stringify(profile || {}))

  return {
    ...sanitizedData,
    averageRating: cleanProfile.average_rating || 0,
    totalReviews: cleanProfile.reviews_count || 0,
  }
}
