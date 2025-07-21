"use server"

import { createClient } from "@/lib/supabase/server"
import { unstable_noStore as noStore } from "next/cache"
import { mapProfileToOperator } from "./data.actions"
import { getCurrentPromotionPrice } from "./promotions.actions"
import { revalidatePath } from "next/cache"

export async function getClientDashboardStats(clientId: string) {
  noStore()
  const supabase = createClient()

  const { data, error } = await supabase.rpc("get_client_dashboard_stats", {
    p_client_id: clientId,
  })

  if (error) {
    console.error("Error fetching client dashboard stats:", error)
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
  const promotionPrice = await getCurrentPromotionPrice()

  const { data, error } = await supabase.rpc("get_favorite_operators", {
    p_client_id: clientId,
  })

  if (error) {
    console.error("Error fetching favorite experts:", error)
    return []
  }

  return (data || []).map((profile) => mapProfileToOperator(profile, promotionPrice))
}

export async function toggleFavoriteOperator(clientId: string, operatorId: string, isFavorite: boolean) {
  const supabase = createClient()

  if (isFavorite) {
    const { error } = await supabase
      .from("favorite_operators")
      .delete()
      .match({ client_id: clientId, operator_id: operatorId })

    if (error) {
      console.error("Error removing favorite:", error)
      return { success: false, error: error.message }
    }
  } else {
    const { error } = await supabase.from("favorite_operators").insert({ client_id: clientId, operator_id: operatorId })

    if (error) {
      console.error("Error adding favorite:", error)
      return { success: false, error: error.message }
    }
  }

  revalidatePath("/dashboard/client")
  return { success: true }
}
