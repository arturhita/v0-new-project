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

  return JSON.parse(JSON.stringify(data || {}))
}

export async function getAdminDashboardData() {
  const [totalUsers, totalOperators, totalRevenue, pendingPayouts] = await Promise.all([
    supabaseAdmin.from("profiles").select("id", { count: "exact" }).neq("role", "admin"),
    supabaseAdmin.from("profiles").select("id", { count: "exact" }).eq("role", "operator"),
    supabaseAdmin.from("transactions").select("amount").eq("type", "deposit"),
    supabaseAdmin.from("payout_requests").select("id", { count: "exact" }).eq("status", "Pending"),
  ])

  const totalRevenueAmount = totalRevenue.data?.reduce((sum, current) => sum + current.amount, 0) || 0

  return {
    totalUsers: totalUsers.count || 0,
    totalOperators: totalOperators.count || 0,
    totalRevenue: totalRevenueAmount,
    pendingPayouts: pendingPayouts.count || 0,
  }
}

export async function getRecentActivities() {
  const { data, error } = await supabaseAdmin
    .from("consultations")
    .select(
      `
            id, created_at, type, cost,
            client:profiles!client_id (full_name),
            operator:profiles!operator_id (stage_name)
        `,
    )
    .order("created_at", { ascending: false })
    .limit(5)

  if (error) {
    console.error("Error fetching recent activities:", error)
    return []
  }
  return data
}
