"use server"

import { createClient } from "@/lib/supabase/server"

export async function getAdminDashboardStats() {
  const supabase = createClient()

  const { count: totalUsers, error: usersError } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
  if (usersError) console.error("Error fetching total users:", usersError.message)

  const { count: activeOperators, error: operatorsError } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "operator")
    .eq("application_status", "approved")
  if (operatorsError) console.error("Error fetching active operators:", operatorsError.message)

  const { data: totalRevenueData, error: revenueError } = await supabase
    .from("transactions")
    .select("amount")
    .eq("type", "consultation_fee")
  if (revenueError) console.error("Error fetching total revenue:", revenueError.message)
  const totalRevenue = totalRevenueData?.reduce((sum, t) => sum + t.amount, 0) || 0

  const { count: consultationsToday, error: consultationsError } = await supabase
    .from("consultations")
    .select("*", { count: "exact", head: true })
    .gte("created_at", new Date(new Date().setHours(0, 0, 0, 0)).toISOString())
  if (consultationsError) console.error("Error fetching consultations today:", consultationsError.message)

  return {
    totalUsers: totalUsers ?? 0,
    activeOperators: activeOperators ?? 0,
    totalRevenue: totalRevenue,
    consultationsToday: consultationsToday ?? 0,
  }
}

export async function getOperatorDashboardStats(operatorId: string) {
  const supabase = createClient()

  const { data: earningsData, error: earningsError } = await supabase
    .from("consultations")
    .select("operator_earning")
    .eq("operator_id", operatorId)
    .eq("status", "completed")
  if (earningsError) console.error("Error fetching operator earnings:", earningsError.message)
  const totalEarnings = earningsData?.reduce((sum, c) => sum + (c.operator_earning || 0), 0) || 0

  const { data: reviewsData, error: reviewsError } = await supabase
    .from("reviews")
    .select("rating")
    .eq("operator_id", operatorId)
    .eq("is_approved", true)
  if (reviewsError) console.error("Error fetching operator reviews:", reviewsError.message)
  const averageRating =
    reviewsData && reviewsData.length > 0 ? reviewsData.reduce((sum, r) => sum + r.rating, 0) / reviewsData.length : 0
  const totalReviews = reviewsData?.length || 0

  const { count: totalConsultations, error: consultationsError } = await supabase
    .from("consultations")
    .select("*", { count: "exact", head: true })
    .eq("operator_id", operatorId)
    .eq("status", "completed")
  if (consultationsError) console.error("Error fetching operator consultations:", consultationsError.message)

  return {
    totalEarnings: totalEarnings,
    averageRating: Number.parseFloat(averageRating.toFixed(1)),
    totalReviews: totalReviews,
    totalConsultations: totalConsultations ?? 0,
  }
}
