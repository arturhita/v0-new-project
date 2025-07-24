"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import type { Profile } from "@/types/profile.types"
import { sanitizeData } from "@/lib/data.utils"

export async function getOperatorDashboardData(): Promise<Profile | null> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect("/login")
  }

  const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (error || !profile) {
    console.error("Errore nel recuperare il profilo operatore:", error?.message)
    return null
  }

  return sanitizeData(profile)
}

export async function getAdminDashboardData() {
  const supabase = createClient()
  const { data, error } = await supabase.rpc("get_admin_kpis")

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

  const kpis = data
    ? {
        totalUsers: data.total_users,
        newUsersThisMonth: data.new_users_this_month,
        activeOperators: data.active_operators,
        newOperatorsThisWeek: data.new_operators_this_week,
        revenueThisMonth: data.revenue_this_month,
        consultationsLast24h: data.consultations_last_24h,
        activePromotions: data.active_promotions,
      }
    : {
        totalUsers: 0,
        newUsersThisMonth: 0,
        activeOperators: 0,
        newOperatorsThisWeek: 0,
        revenueThisMonth: 0,
        consultationsLast24h: 0,
        activePromotions: 0,
      }

  return { kpis }
}

export async function getRecentActivities() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, created_at")
    .order("created_at", { ascending: false })
    .limit(5)

  if (error) {
    console.error("Error fetching recent activities:", error)
    return []
  }

  return data || []
}
