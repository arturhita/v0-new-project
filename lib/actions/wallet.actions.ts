"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

// Recupera il portafoglio dell'utente autenticato
export async function getUserWallet() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Utente non autenticato." }
  }

  const { data, error } = await supabase.from("wallets").select("balance").eq("user_id", user.id).single()

  if (error) {
    console.error("Errore nel recupero del portafoglio:", error)
    return { error: "Impossibile recuperare il saldo del portafoglio." }
  }

  return { balance: data.balance }
}

// Aggiunge fondi al portafoglio (es. dopo un pagamento Stripe)
export async function addFundsToWallet(userId: string, amount: number, description: string, metadata: object) {
  if (amount <= 0) {
    return { success: false, message: "L'importo deve essere positivo." }
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase.rpc("update_wallet_balance", {
    p_user_id: userId,
    p_amount: amount,
    p_transaction_type: "deposit",
    p_description: description,
    p_metadata: metadata,
  })

  if (error || !data.success) {
    console.error("Errore nell'aggiungere fondi:", error || data.message)
    return { success: false, message: "Errore durante la ricarica del portafoglio." }
  }

  revalidatePath("/dashboard/client/wallet")
  return { success: true, new_balance: data.new_balance }
}

// Recupera lo storico delle transazioni per l'utente autenticato
export async function getTransactionHistory() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Utente non autenticato." }
  }

  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50)

  if (error) {
    console.error("Errore nel recupero dello storico transazioni:", error)
    return { error: "Impossibile recuperare lo storico delle transazioni." }
  }

  return { transactions: data }
}
