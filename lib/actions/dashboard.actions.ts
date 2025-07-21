"use server"

import { createClient } from "@/lib/supabase/server"

export async function getAdminDashboardData() {
  const supabase = createClient()

  try {
    // Get total counts
    const { count: totalUsers } = await supabase.from("profiles").select("*", { count: "exact", head: true })

    const { count: totalOperators } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "operator")

    const { count: activeOperators } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "operator")
      .eq("is_online", true)

    const { count: totalSessions } = await supabase.from("chat_sessions").select("*", { count: "exact", head: true })

    // Get revenue data
    const { data: revenueData } = await supabase
      .from("wallet_transactions")
      .select("amount, created_at")
      .eq("transaction_type", "credit")
      .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

    const totalRevenue = revenueData?.reduce((sum, transaction) => sum + transaction.amount, 0) || 0

    return {
      totalUsers: totalUsers || 0,
      totalOperators: totalOperators || 0,
      activeOperators: activeOperators || 0,
      totalSessions: totalSessions || 0,
      totalRevenue,
      revenueData: revenueData || [],
    }
  } catch (error) {
    console.error("Error fetching admin dashboard data:", error)
    return {
      totalUsers: 0,
      totalOperators: 0,
      activeOperators: 0,
      totalSessions: 0,
      totalRevenue: 0,
      revenueData: [],
    }
  }
}

export async function getRecentActivities() {
  const supabase = createClient()

  try {
    // Get recent registrations
    const { data: recentUsers } = await supabase
      .from("profiles")
      .select("full_name, role, created_at")
      .order("created_at", { ascending: false })
      .limit(10)

    // Get recent sessions
    const { data: recentSessions } = await supabase
      .from("chat_sessions")
      .select(`
        *,
        client:profiles!chat_sessions_client_id_fkey(full_name),
        operator:profiles!chat_sessions_operator_id_fkey(stage_name)
      `)
      .order("created_at", { ascending: false })
      .limit(10)

    return {
      recentUsers: recentUsers || [],
      recentSessions: recentSessions || [],
    }
  } catch (error) {
    console.error("Error fetching recent activities:", error)
    return {
      recentUsers: [],
      recentSessions: [],
    }
  }
}

export async function getOperatorDashboardData(operatorId: string) {
  const supabase = createClient()

  try {
    // Get session counts
    const { count: totalSessions } = await supabase
      .from("chat_sessions")
      .select("*", { count: "exact", head: true })
      .eq("operator_id", operatorId)

    const { count: activeSessions } = await supabase
      .from("chat_sessions")
      .select("*", { count: "exact", head: true })
      .eq("operator_id", operatorId)
      .eq("status", "active")

    // Get earnings
    const { data: earnings } = await supabase
      .from("chat_sessions")
      .select("total_cost")
      .eq("operator_id", operatorId)
      .eq("status", "ended")

    const totalEarnings = earnings?.reduce((sum, session) => sum + (session.total_cost || 0), 0) || 0

    // Get recent sessions
    const { data: recentSessions } = await supabase
      .from("chat_sessions")
      .select(`
        *,
        client:profiles!chat_sessions_client_id_fkey(full_name, avatar_url)
      `)
      .eq("operator_id", operatorId)
      .order("created_at", { ascending: false })
      .limit(5)

    return {
      totalSessions: totalSessions || 0,
      activeSessions: activeSessions || 0,
      totalEarnings,
      recentSessions: recentSessions || [],
    }
  } catch (error) {
    console.error("Error fetching operator dashboard data:", error)
    return {
      totalSessions: 0,
      activeSessions: 0,
      totalEarnings: 0,
      recentSessions: [],
    }
  }
}
