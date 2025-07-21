"use server"

import { createClient } from "@/lib/supabase/server"

export async function getClientDashboardData() {
  const supabase = createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: "User not authenticated" }
    }

    // Get client profile with wallet balance
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (profileError) throw profileError

    // Get recent chat sessions
    const { data: chatSessions, error: chatError } = await supabase
      .from("chat_sessions")
      .select(`
        *,
        operator:profiles!chat_sessions_operator_id_fkey(stage_name, avatar_url)
      `)
      .eq("client_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5)

    // Get recent call sessions
    const { data: callSessions, error: callError } = await supabase
      .from("call_sessions")
      .select(`
        *,
        operator:profiles!call_sessions_operator_id_fkey(stage_name, avatar_url)
      `)
      .eq("client_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5)

    // Get recent written consultations
    const { data: writtenConsultations, error: consultationError } = await supabase
      .from("written_consultations")
      .select(`
        *,
        operator:profiles!written_consultations_operator_id_fkey(stage_name, avatar_url)
      `)
      .eq("client_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5)

    // Get favorite operators
    const { data: favorites, error: favoritesError } = await supabase
      .from("favorites")
      .select(`
        *,
        operator:profiles!favorites_operator_id_fkey(*)
      `)
      .eq("client_id", user.id)
      .limit(5)

    // Get recent wallet transactions
    const { data: transactions, error: transactionsError } = await supabase
      .from("wallet_transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10)

    return {
      success: true,
      data: {
        profile,
        chatSessions: chatSessions || [],
        callSessions: callSessions || [],
        writtenConsultations: writtenConsultations || [],
        favorites: (favorites || []).map((f) => f.operator).filter(Boolean),
        transactions: transactions || [],
      },
    }
  } catch (error) {
    console.error("Error fetching client dashboard data:", error)
    return { success: false, error: "Failed to fetch dashboard data" }
  }
}

export async function getOperatorDashboardData() {
  const supabase = createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: "User not authenticated" }
    }

    // Get operator profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (profileError) throw profileError

    // Get recent chat sessions
    const { data: chatSessions, error: chatError } = await supabase
      .from("chat_sessions")
      .select(`
        *,
        client:profiles!chat_sessions_client_id_fkey(full_name, avatar_url)
      `)
      .eq("operator_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5)

    // Get recent call sessions
    const { data: callSessions, error: callError } = await supabase
      .from("call_sessions")
      .select(`
        *,
        client:profiles!call_sessions_client_id_fkey(full_name, avatar_url)
      `)
      .eq("operator_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5)

    // Get pending written consultations
    const { data: pendingConsultations, error: consultationError } = await supabase
      .from("written_consultations")
      .select(`
        *,
        client:profiles!written_consultations_client_id_fkey(full_name, avatar_url)
      `)
      .eq("operator_id", user.id)
      .eq("status", "pending")
      .order("created_at", { ascending: false })

    // Get recent reviews
    const { data: reviews, error: reviewsError } = await supabase
      .from("reviews")
      .select(`
        *,
        user:profiles!reviews_user_id_fkey(full_name, avatar_url)
      `)
      .eq("operator_id", user.id)
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(5)

    // Calculate earnings for current month
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const [chatEarnings, callEarnings, consultationEarnings] = await Promise.all([
      supabase
        .from("chat_sessions")
        .select("total_cost")
        .eq("operator_id", user.id)
        .eq("status", "ended")
        .gte("created_at", startOfMonth.toISOString()),
      supabase
        .from("call_sessions")
        .select("cost")
        .eq("operator_id", user.id)
        .eq("status", "completed")
        .gte("created_at", startOfMonth.toISOString()),
      supabase
        .from("written_consultations")
        .select("cost")
        .eq("operator_id", user.id)
        .eq("status", "answered")
        .gte("created_at", startOfMonth.toISOString()),
    ])

    const monthlyEarnings = [
      ...(chatEarnings.data || []).map((s) => s.total_cost || 0),
      ...(callEarnings.data || []).map((s) => s.cost || 0),
      ...(consultationEarnings.data || []).map((s) => s.cost || 0),
    ].reduce((sum, cost) => sum + cost, 0)

    return {
      success: true,
      data: {
        profile,
        chatSessions: chatSessions || [],
        callSessions: callSessions || [],
        pendingConsultations: pendingConsultations || [],
        reviews: reviews || [],
        monthlyEarnings,
      },
    }
  } catch (error) {
    console.error("Error fetching operator dashboard data:", error)
    return { success: false, error: "Failed to fetch dashboard data" }
  }
}

export async function getAdminDashboardData() {
  const supabase = createClient()

  try {
    // Get total counts
    const [
      usersCount,
      operatorsCount,
      activeOperatorsCount,
      chatSessionsCount,
      callSessionsCount,
      consultationsCount,
      reviewsCount,
      pendingReviewsCount,
    ] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "client"),
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "operator"),
      supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "operator")
        .eq("is_online", true),
      supabase.from("chat_sessions").select("*", { count: "exact", head: true }),
      supabase.from("call_sessions").select("*", { count: "exact", head: true }),
      supabase.from("written_consultations").select("*", { count: "exact", head: true }),
      supabase.from("reviews").select("*", { count: "exact", head: true }),
      supabase.from("reviews").select("*", { count: "exact", head: true }).eq("status", "pending"),
    ])

    // Get recent activities
    const { data: recentSessions, error: sessionsError } = await supabase
      .from("chat_sessions")
      .select(`
        *,
        client:profiles!chat_sessions_client_id_fkey(full_name),
        operator:profiles!chat_sessions_operator_id_fkey(stage_name)
      `)
      .order("created_at", { ascending: false })
      .limit(10)

    // Calculate revenue for current month
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const [chatRevenue, callRevenue, consultationRevenue] = await Promise.all([
      supabase
        .from("chat_sessions")
        .select("total_cost")
        .eq("status", "ended")
        .gte("created_at", startOfMonth.toISOString()),
      supabase
        .from("call_sessions")
        .select("cost")
        .eq("status", "completed")
        .gte("created_at", startOfMonth.toISOString()),
      supabase
        .from("written_consultations")
        .select("cost")
        .eq("status", "answered")
        .gte("created_at", startOfMonth.toISOString()),
    ])

    const monthlyRevenue = [
      ...(chatRevenue.data || []).map((s) => s.total_cost || 0),
      ...(callRevenue.data || []).map((s) => s.cost || 0),
      ...(consultationRevenue.data || []).map((s) => s.cost || 0),
    ].reduce((sum, cost) => sum + cost, 0)

    return {
      success: true,
      data: {
        stats: {
          totalUsers: usersCount.count || 0,
          totalOperators: operatorsCount.count || 0,
          activeOperators: activeOperatorsCount.count || 0,
          totalChatSessions: chatSessionsCount.count || 0,
          totalCallSessions: callSessionsCount.count || 0,
          totalConsultations: consultationsCount.count || 0,
          totalReviews: reviewsCount.count || 0,
          pendingReviews: pendingReviewsCount.count || 0,
          monthlyRevenue,
        },
        recentSessions: recentSessions || [],
      },
    }
  } catch (error) {
    console.error("Error fetching admin dashboard data:", error)
    return { success: false, error: "Failed to fetch dashboard data" }
  }
}
