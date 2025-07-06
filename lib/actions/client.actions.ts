"use server"

import { createClient } from "@/lib/supabase/server"

interface ClientDashboardData {
  walletBalance: number
  recentConsultationsCount: number
  unreadMessagesCount: number
}

export async function getClientDashboardData(clientId: string): Promise<ClientDashboardData> {
  const supabase = createClient()

  const { data: walletData, error: walletError } = await supabase
    .from("wallets")
    .select("balance")
    .eq("user_id", clientId)
    .single()

  if (walletError && walletError.code !== "PGRST116") {
    // PGRST116: no rows found
    console.error("Error fetching wallet balance:", walletError)
  }

  const { count: consultationsCount, error: consultationsError } = await supabase
    .from("consultations")
    .select("*", { count: "exact", head: true })
    .eq("client_id", clientId)
  // .gte('start_time', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Esempio: ultimi 30 giorni

  if (consultationsError) {
    console.error("Error fetching consultations count:", consultationsError)
  }

  const { count: messagesCount, error: messagesError } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("receiver_id", clientId)
    .eq("is_read", false)

  if (messagesError) {
    console.error("Error fetching unread messages count:", messagesError)
  }

  return {
    walletBalance: walletData?.balance ?? 0,
    recentConsultationsCount: consultationsCount ?? 0,
    unreadMessagesCount: messagesCount ?? 0,
  }
}
