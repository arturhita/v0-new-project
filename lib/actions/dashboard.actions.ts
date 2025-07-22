"use server"

import { createClient } from "@/lib/supabase/server"
import { unstable_noStore as noStore } from "next/cache"

export async function getAdminDashboardData() {
  const supabase = createClient()
  noStore()

  try {
    const [
      { data: users, error: usersError },
      { data: revenue, error: revenueError },
      { data: consultations, error: consultationsError },
      { data: pendingOperators, error: pendingOperatorsError },
      { data: activePromotions, error: activePromotionsError },
    ] = await Promise.all([
      supabase.rpc("count_users_by_role"),
      supabase.rpc("get_monthly_revenue"),
      supabase.rpc("get_monthly_consultations_count"),
      supabase.from("profiles").select("id", { count: "exact" }).eq("status", "pending").eq("role", "operator"),
      supabase
        .from("promotions")
        .select("id", { count: "exact" })
        .gte("end_date", new Date().toISOString())
        .lte("start_date", new Date().toISOString()),
    ])

    if (usersError || revenueError || consultationsError || pendingOperatorsError || activePromotionsError) {
      console.error("Error fetching admin dashboard data:", {
        usersError,
        revenueError,
        consultationsError,
        pendingOperatorsError,
        activePromotionsError,
      })
    }

    const operatorCount = users?.find((u: any) => u.role === "operator")?.count || 0
    const clientCount = users?.find((u: any) => u.role === "client")?.count || 0
    const totalUsers = operatorCount + clientCount

    const newUsersThisMonthData = await supabase.rpc("get_new_users_this_month")
    const newOperatorsThisWeekData = await supabase.rpc("get_new_operators_this_week")
    const consultationsLast24hData = await supabase.rpc("get_consultations_last_24h")

    return {
      kpis: {
        totalUsers: totalUsers,
        newUsersThisMonth: newUsersThisMonthData.data?.[0]?.count || 0,
        activeOperators: operatorCount,
        newOperatorsThisWeek: newOperatorsThisWeekData.data?.[0]?.count || 0,
        revenueThisMonth: revenue?.[0]?.total_revenue || 0,
        consultationsLast24h: consultationsLast24hData.data?.[0]?.count || 0,
        activePromotions: activePromotions?.count || 0,
        pendingOperatorRequests: pendingOperators?.count || 0,
      },
    }
  } catch (error) {
    console.error("A critical error occurred in getAdminDashboardData:", error)
    return {
      kpis: {
        totalUsers: 0,
        newUsersThisMonth: 0,
        activeOperators: 0,
        newOperatorsThisWeek: 0,
        revenueThisMonth: 0,
        consultationsLast24h: 0,
        activePromotions: 0,
        pendingOperatorRequests: 0,
      },
    }
  }
}

export async function getRecentActivities() {
  noStore()
  const supabase = createClient()

  const { data, error } = await supabase
    .from("profiles")
    .select("id, created_at, full_name, email, role")
    .order("created_at", { ascending: false })
    .limit(5)

  if (error) {
    console.error("Error fetching recent activities:", error)
    return []
  }

  return data
}

export async function getOperatorDashboardData(operatorId: string) {
  noStore()
  const supabase = createClient()

  try {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("average_rating, reviews_count")
      .eq("id", operatorId)
      .single()

    if (profileError) {
      console.error("Error fetching operator profile for dashboard:", profileError)
      // Return a default structure on error to avoid breaking the UI
      return {
        totalEarningsMonth: 0,
        pendingConsultations: 0,
        totalConsultationsMonth: 0,
        unreadMessages: 0,
        newClientsMonth: 0,
        averageRating: 0,
        totalReviews: 0,
      }
    }

    const { data: stats, error: statsError } = await supabase.rpc("get_operator_dashboard_stats", {
      p_operator_id: operatorId,
    })

    if (statsError) {
      console.error("Error fetching operator dashboard stats:", statsError)
      // Return a default structure on error
      return {
        totalEarningsMonth: 0,
        pendingConsultations: 0,
        totalConsultationsMonth: 0,
        unreadMessages: 0,
        newClientsMonth: 0,
        averageRating: profile.average_rating || 0,
        totalReviews: profile.reviews_count || 0,
      }
    }

    return {
      ...stats,
      averageRating: profile.average_rating || 0,
      totalReviews: profile.reviews_count || 0,
    }
  } catch (error) {
    console.error("A critical error occurred in getOperatorDashboardData:", error)
    return {
      totalEarningsMonth: 0,
      pendingConsultations: 0,
      totalConsultationsMonth: 0,
      unreadMessages: 0,
      newClientsMonth: 0,
      averageRating: 0,
      totalReviews: 0,
    }
  }
}
