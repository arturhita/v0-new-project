"use server"

import { createClient } from "@/lib/supabase/server"

export async function getWalletBalance(userId: string) {
  const supabase = createClient()

  const { data: profile, error } = await supabase.from("profiles").select("wallet_balance").eq("id", userId).single()

  if (error) {
    console.error("Error fetching wallet balance:", error)
    return 0
  }

  return profile?.wallet_balance || 0
}

export async function getClientDashboardStats(userId: string) {
  const supabase = createClient()

  try {
    // Get wallet balance
    const { data: profile } = await supabase.from("profiles").select("wallet_balance").eq("id", userId).single()

    // Get consultation counts
    const { count: chatCount } = await supabase
      .from("chat_sessions")
      .select("*", { count: "exact", head: true })
      .eq("client_id", userId)

    const { count: callCount } = await supabase
      .from("call_sessions")
      .select("*", { count: "exact", head: true })
      .eq("client_id", userId)

    const { count: writtenCount } = await supabase
      .from("written_consultations")
      .select("*", { count: "exact", head: true })
      .eq("client_id", userId)

    // Get favorite experts count
    const { count: favoritesCount } = await supabase
      .from("favorites")
      .select("*", { count: "exact", head: true })
      .eq("client_id", userId)

    return {
      walletBalance: profile?.wallet_balance || 0,
      totalConsultations: (chatCount || 0) + (callCount || 0) + (writtenCount || 0),
      favoriteExperts: favoritesCount || 0,
      chatSessions: chatCount || 0,
      callSessions: callCount || 0,
      writtenConsultations: writtenCount || 0,
    }
  } catch (error) {
    console.error("Error fetching client dashboard stats:", error)
    return {
      walletBalance: 0,
      totalConsultations: 0,
      favoriteExperts: 0,
      chatSessions: 0,
      callSessions: 0,
      writtenConsultations: 0,
    }
  }
}

export async function getFavoriteExperts(userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("favorites")
    .select(`
      *,
      operator:profiles!favorites_operator_id_fkey(
        id,
        stage_name,
        avatar_url,
        bio,
        categories,
        average_rating,
        reviews_count,
        is_online
      )
    `)
    .eq("client_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching favorite experts:", error)
    return []
  }

  return data || []
}
