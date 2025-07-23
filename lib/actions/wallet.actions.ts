"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getWalletBalance() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "User not authenticated" }
  }

  const { data, error } = await supabase.from("wallets").select("balance").eq("user_id", user.id).single()

  if (error) {
    console.error("Error fetching wallet balance:", error)
    return { error: "Could not fetch wallet balance." }
  }

  return { balance: data.balance }
}

export async function addFundsToWallet(userId: string, amount: number, description: string) {
  const supabase = createClient()
  const { data: wallet, error: walletError } = await supabase
    .from("wallets")
    .select("id")
    .eq("user_id", userId)
    .single()

  if (walletError || !wallet) {
    return { error: "Wallet not found for user." }
  }

  const { error } = await supabase.rpc("update_wallet_balance", {
    wallet_id_input: wallet.id,
    amount_change: amount,
    transaction_type_input: "deposit",
    description_input: description,
  })

  if (error) {
    console.error("Error adding funds:", error)
    return { error: "Failed to add funds to wallet." }
  }

  revalidatePath("/dashboard/client/wallet")
  return { success: true }
}

export async function getTransactionHistory() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "User not authenticated", transactions: [] }
  }

  const { data, error } = await supabase.rpc("get_user_transaction_history")

  if (error) {
    console.error("Error fetching transaction history:", error)
    return { error: "Could not fetch transaction history.", transactions: [] }
  }

  return { transactions: data || [] }
}
