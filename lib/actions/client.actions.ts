"use server"

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { unstable_noStore as noStore } from "next/cache"
import type { Operator } from "@/types/database"

export async function getClientDashboardStats(userId: string) {
  noStore()
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { data: stats, error: statsError } = await supabase
    .rpc("get_client_dashboard_stats", { p_user_id: userId })
    .single()

  if (statsError) {
    console.error("Error fetching client dashboard stats:", statsError)
    return {
      total_consultations: 0,
      total_spent: 0,
      favorite_operators_count: 0,
      walletBalance: 0,
    }
  }

  // Fetch wallet balance separately
  const { data: walletData, error: walletError } = await supabase
    .from("wallets")
    .select("balance")
    .eq("user_id", userId)
    .single()

  // It's okay if no wallet exists yet, default to 0.
  if (walletError && walletError.code !== "PGRST116") {
    console.error("Error fetching wallet:", walletError.message)
  }

  const walletBalance = walletData?.balance ?? 0

  return {
    ...stats,
    walletBalance,
  }
}

export async function getFavoriteExperts(userId: string): Promise<Operator[]> {
  noStore()
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase.rpc("get_favorite_operators_for_client", { p_user_id: userId })

  if (error) {
    console.error("Error fetching favorite experts:", error)
    return []
  }

  // The RPC returns a JSON array, so we might need to parse it if it's not done automatically.
  // Assuming the RPC is set up to return rows directly that match the Operator type.
  return data as Operator[]
}
