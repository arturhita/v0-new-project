"use server"

import { createClient } from "@/lib/supabase/server"
import { unstable_noStore as noStore } from "next/cache"
import { mapProfileToOperator } from "./data.actions"

export async function getClientDashboardStats(clientId: string) {
  noStore()
  const supabase = createClient()

  const { data, error } = await supabase.rpc("get_client_dashboard_stats", {
    p_client_id: clientId,
  })

  if (error) {
    return {
      recentConsultationsCount: 0,
      unreadMessagesCount: 0,
      walletBalance: 0,
    }
  }

  const stats = data[0]

  return {
    recentConsultationsCount: stats.recent_consultations_count || 0,
    unreadMessagesCount: stats.unread_messages_count || 0,
    walletBalance: stats.wallet_balance || 0,
  }
}

export async function getFavoriteExperts(clientId: string) {
  noStore()
  const supabase = createClient()

  const { data, error } = await supabase.rpc("get_favorite_operators", {
    p_client_id: clientId,
  })

  if (error) {
    return []
  }

  return (data || []).map((profile) => mapProfileToOperator(profile))
}
