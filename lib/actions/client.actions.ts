"use server"

import { createClient } from "@/lib/supabase/server"
import { unstable_noStore as noStore } from "next/cache"

export async function getClientDashboardData(userId: string) {
  // Impedisce la cache statica dei dati, così sono sempre aggiornati
  noStore()

  const supabase = createClient()

  // Array di promesse per eseguire le query in parallelo
  const [walletData, consultationsData, messagesData] = await Promise.all([
    // 1. Recupera il saldo del wallet
    supabase
      .from("wallets")
      .select("balance")
      .eq("user_id", userId)
      .single(),

    // 2. Conta le consulenze passate
    supabase
      .from("consultations")
      .select("id", { count: "exact" })
      .eq("client_id", userId),

    // 3. Conta i messaggi non letti
    supabase
      .from("messages")
      .select("id", { count: "exact" })
      .eq("receiver_id", userId)
      .eq("is_read", false),
  ])

  // Gestione degli errori e formattazione dei risultati
  if (walletData.error) {
    console.error("Error fetching wallet:", walletData.error.message)
  }
  if (consultationsData.error) {
    console.error("Error fetching consultations:", consultationsData.error.message)
  }
  if (messagesData.error) {
    console.error("Error fetching messages:", messagesData.error.message)
  }

  return {
    walletBalance: walletData.data?.balance ?? 0,
    recentConsultationsCount: consultationsData.count ?? 0,
    unreadMessagesCount: messagesData.count ?? 0,
  }
}
