"use server"

import { createClient } from "@/lib/supabase/server"

export async function getWalletBalance() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Utente non autenticato." }
  }

  try {
    const { data, error } = await supabase.from("wallets").select("balance").eq("user_id", user.id).single()

    // La tabella wallet viene creata da un trigger quando l'utente si registra.
    // Se c'è un errore qui, è probabile che sia un problema diverso da "nessuna riga trovata".
    if (error) {
      // Il trigger potrebbe non essere stato eseguito, gestiamo il caso in cui il wallet non esista.
      if (error.code === "PGRST116") {
        console.warn(`Wallet non trovato per l'utente ${user.id}. Restituisco 0.`)
        return { balance: 0 }
      }
      throw error
    }

    return { balance: data.balance }
  } catch (error) {
    console.error("Errore nel recupero del saldo del wallet:", error)
    return { error: "Impossibile recuperare il saldo del wallet." }
  }
}
