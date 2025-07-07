"use server"

import { createClient } from "@/lib/supabase/server"

export async function getWalletTransactions(userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("wallet_transactions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching wallet transactions:", error)
    return []
  }

  return data
}
