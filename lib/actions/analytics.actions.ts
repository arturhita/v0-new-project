"use server"

import { createClient } from "@/lib/supabase/server"

export async function getAdminDashboardAnalytics() {
  const supabase = createClient()

  try {
    const { count: totalUsers, error: usersError } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "client")

    const { count: totalOperators, error: operatorsError } = await supabase
      .from("operators")
      .select("*", { count: "exact", head: true })

    const { data: totalRevenueData, error: revenueError } = await supabase.rpc("get_total_revenue")

    const { count: pendingApprovals, error: approvalsError } = await supabase
      .from("operator_applications")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending")

    if (usersError || operatorsError || revenueError || approvalsError) {
      console.error("Error fetching analytics:", {
        usersError,
        operatorsError,
        revenueError,
        approvalsError,
      })
      // Return zeroed data on error to avoid breaking the UI
      return {
        totalUsers: 0,
        totalOperators: 0,
        totalRevenue: 0,
        pendingApprovals: 0,
      }
    }

    return {
      totalUsers: totalUsers ?? 0,
      totalOperators: totalOperators ?? 0,
      totalRevenue: totalRevenueData ?? 0,
      pendingApprovals: pendingApprovals ?? 0,
    }
  } catch (error) {
    console.error("Catastrophic error in getAdminDashboardAnalytics:", error)
    return {
      totalUsers: 0,
      totalOperators: 0,
      totalRevenue: 0,
      pendingApprovals: 0,
    }
  }
}
