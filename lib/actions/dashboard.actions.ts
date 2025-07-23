"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { unstable_noStore as noStore } from "next/cache"

export async function getAdminDashboardData() {
  noStore()
  const supabase = createAdminClient()

  const { data, error } = await supabase.rpc("get_admin_dashboard_kpis").single()

  if (error) {
    console.error("Error fetching admin dashboard KPIs:", error)
    return {
      kpis: {
        totalUsers: 0,
        newUsersThisMonth: 0,
        activeOperators: 0,
        newOperatorsThisWeek: 0,
        revenueThisMonth: 0,
        consultationsLast24h: 0,
        activePromotions: 0,
      },
    }
  }

  return { kpis: data }
}

export async function getRecentActivities() {
  noStore()
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("consultations")
    .select(
      `
      id,
      created_at,
      price,
      client:client_id ( full_name ),
      operator:operator_id ( full_name )
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

export async function getOperatorDashboardData() {
  noStore()
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    console.error("Operator not authenticated")
    return null
  }

  const { data, error } = await supabase.rpc("get_operator_dashboard_data", { p_operator_id: user.id }).single()

  if (error) {
    console.error("Error fetching operator dashboard data:", error)
    return null
  }

  return data
}
