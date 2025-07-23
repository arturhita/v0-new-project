"use server"

import { createClient } from "@/lib/supabase/server"

export async function getUserWallet() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Utente non autenticato" }
  }

  const { data, error } = await supabase.from("wallets").select("*").eq("user_id", user.id).single()

  if (error) {
    console.error("Error fetching wallet:", error)
    return { error: "Impossibile recuperare il portafoglio." }
  }

  return { data }
}

export async function getWalletBalance(): Promise<{ balance: number | null; error?: string }> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { balance: null, error: "Utente non autenticato" }
  }

  const { data, error } = await supabase.from("wallets").select("balance").eq("user_id", user.id).single()

  if (error) {
    console.error("Error fetching wallet balance:", error)
    return { balance: null, error: "Impossibile recuperare il saldo." }
  }

  return { balance: data.balance }
}

export async function addFundsToWallet(userId: string, amount: number, paymentIntentId: string) {
  // This would be called by a Stripe webhook, so it needs to use the admin client
  // For now, we'll assume it's a trusted server-side call
  const supabase = createClient() // In a real scenario, use admin client
  const { data, error } = await supabase.rpc("update_wallet_balance", {
    p_user_id: userId,
    p_amount: amount,
    p_transaction_type: "deposit",
    p_description: `Ricarica tramite Stripe (ID: ${paymentIntentId})`,
  })

  if (error) {
    return { success: false, error: error.message }
  }
  return { success: true }
}

export async function getTransactionHistory() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Utente non autenticato" }
  }

  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching transactions:", error)
    return { error: "Impossibile recuperare lo storico delle transazioni." }
  }

  return { data }
}
