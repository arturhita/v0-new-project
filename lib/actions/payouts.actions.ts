"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// Funzione per ottenere le impostazioni di pagamento di un operatore
export async function getPayoutSettings(operatorId: string) {
  const supabase = createClient()
  const { data, error } = await supabase.from("operator_payout_settings").select("*").eq("id", operatorId).single()

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching payout settings:", error)
    return null
  }
  return data
}

// Funzione per salvare le impostazioni di pagamento di un operatore
export async function savePayoutSettings(operatorId: string, prevState: any, formData: FormData) {
  const supabase = createClient()
  const settingsData = {
    id: operatorId,
    payout_method: formData.get("payout_method") as string,
    paypal_email: formData.get("paypal_email") as string,
    bank_account_holder: formData.get("bank_account_holder") as string,
    iban: formData.get("iban") as string,
    swift_bic: formData.get("swift_bic") as string,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase.from("operator_payout_settings").upsert(settingsData)

  if (error) {
    console.error("Error saving payout settings:", error)
    return { success: false, message: "Errore durante il salvataggio delle impostazioni." }
  }

  revalidatePath("/(platform)/dashboard/operator/payout-settings")
  return { success: true, message: "Impostazioni di pagamento salvate." }
}

// Funzione per ottenere le richieste di commissione di un operatore
export async function getCommissionRequests(operatorId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("commission_requests")
    .select("*")
    .eq("operator_id", operatorId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching commission requests:", error)
    return []
  }
  return data
}

// Funzione per inviare una richiesta di modifica commissione
export async function submitCommissionRequest(prevState: any, formData: FormData) {
  const supabase = createClient()
  const operatorId = formData.get("operator_id") as string
  const currentRate = Number.parseFloat(formData.get("current_commission_rate") as string)
  const requestedRate = Number.parseFloat(formData.get("requested_commission_rate") as string)
  const reason = formData.get("reason") as string

  const { error } = await supabase.from("commission_requests").insert({
    operator_id: operatorId,
    current_commission_rate: currentRate,
    requested_commission_rate: requestedRate,
    reason: reason,
  })

  if (error) {
    console.error("Error submitting commission request:", error)
    return { success: false, message: "Errore durante l'invio della richiesta." }
  }

  revalidatePath("/(platform)/dashboard/operator/commission-request")
  return { success: true, message: "Richiesta inviata con successo." }
}

// Funzione per ottenere il riepilogo dei guadagni
export async function getOperatorEarningsSummary(operatorId: string) {
  const supabase = createClient()
  const { data, error } = await supabase.rpc("get_operator_earnings_summary", { p_operator_id: operatorId }).single()

  if (error) {
    console.error("Error fetching earnings summary:", error)
    return { total_earnings: 0, pending_payout: 0, last_payout_amount: 0, last_payout_date: null }
  }
  return data
}
