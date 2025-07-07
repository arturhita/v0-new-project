"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import type { PayoutMethod, PayoutRequestWithDetails } from "@/types/database.types"

// Funzioni per l'Operatore

export async function getOperatorEarningsData(operatorId: string) {
  const supabase = createClient()

  const { data: earnings, error: earningsError } = await supabase
    .from("earnings")
    .select("net_earning")
    .eq("operator_id", operatorId)

  const { data: payouts, error: payoutsError } = await supabase
    .from("payout_requests")
    .select("amount, status")
    .eq("operator_id", operatorId)

  if (earningsError || payoutsError) {
    console.error("Error fetching earnings data:", earningsError || payoutsError)
    return {
      totalEarned: 0,
      pendingPayout: 0,
      withdrawn: 0,
      availableForPayout: 0,
      earningsHistory: [],
    }
  }

  const totalEarned = earnings.reduce((acc, e) => acc + e.net_earning, 0)
  const pendingPayout = payouts.filter((p) => p.status === "pending").reduce((acc, p) => acc + p.amount, 0)
  const withdrawn = payouts.filter((p) => p.status === "completed").reduce((acc, p) => acc + p.amount, 0)
  const availableForPayout = totalEarned - pendingPayout - withdrawn

  const { data: earningsHistory, error: historyError } = await supabase
    .from("earnings")
    .select("created_at, net_earning, consultations(id, client_id, profiles(stage_name))")
    .eq("operator_id", operatorId)
    .order("created_at", { ascending: false })
    .limit(50)

  return {
    totalEarned,
    pendingPayout,
    withdrawn,
    availableForPayout,
    earningsHistory: historyError ? [] : earningsHistory,
  }
}

export async function getOperatorPayoutMethods(operatorId: string): Promise<PayoutMethod[]> {
  const supabase = createClient()
  const { data, error } = await supabase.from("operator_payout_methods").select("*").eq("operator_id", operatorId)
  if (error) {
    console.error("Error fetching payout methods:", error)
    return []
  }
  return data
}

export async function saveOperatorPayoutMethod(operatorId: string, formData: FormData) {
  const supabase = createClient()
  const methodType = formData.get("method_type") as string
  const isDefault = formData.get("is_default") === "on"

  let details = {}
  if (methodType === "paypal") {
    details = { email: formData.get("paypal_email") }
  } else if (methodType === "iban") {
    details = {
      account_holder: formData.get("iban_account_holder"),
      iban: formData.get("iban_number"),
      bank_name: formData.get("iban_bank_name"),
    }
  } else {
    return { success: false, message: "Metodo di pagamento non valido." }
  }

  if (isDefault) {
    const { error: updateError } = await supabase
      .from("operator_payout_methods")
      .update({ is_default: false })
      .eq("operator_id", operatorId)
    if (updateError) console.error("Error unsetting default payout method:", updateError)
  }

  const { error } = await supabase.from("operator_payout_methods").insert({
    operator_id: operatorId,
    method_type: methodType,
    details: details,
    is_default: isDefault,
  })

  if (error) {
    console.error("Error saving payout method:", error)
    return { success: false, message: `Errore nel salvataggio: ${error.message}` }
  }

  revalidatePath("/dashboard/operator/payout-settings")
  return { success: true, message: "Metodo di pagamento salvato." }
}

// AGGIORNATA CON REGOLA DEI 15 GIORNI
export async function createPayoutRequest(operatorId: string, amount: number) {
  const supabase = createClient()

  // 0. Controlla se è una finestra di pagamento valida (1-5 e 16-20 di ogni mese)
  const today = new Date().getDate()
  const isPayoutWindow = (today >= 1 && today <= 5) || (today >= 16 && today <= 20)
  if (!isPayoutWindow) {
    return {
      success: false,
      message: "Le richieste di pagamento sono aperte solo dall'1 al 5 e dal 16 al 20 di ogni mese.",
    }
  }

  // 1. Controlla se l'operatore ha un metodo di pagamento di default
  const { data: defaultMethod, error: methodError } = await supabase
    .from("operator_payout_methods")
    .select("id")
    .eq("operator_id", operatorId)
    .eq("is_default", true)
    .single()

  if (methodError || !defaultMethod) {
    return { success: false, message: "Imposta un metodo di pagamento di default prima di richiedere un pagamento." }
  }

  // 2. Controlla se l'importo è valido
  const earningsData = await getOperatorEarningsData(operatorId)
  if (amount <= 0) {
    return { success: false, message: "L'importo deve essere maggiore di zero." }
  }
  if (amount > earningsData.availableForPayout) {
    return { success: false, message: "Importo richiesto superiore al saldo disponibile." }
  }

  // 3. Crea la richiesta di pagamento
  const { error } = await supabase.from("payout_requests").insert({
    operator_id: operatorId,
    amount: amount,
    payout_method_id: defaultMethod.id,
    status: "pending",
  })

  if (error) {
    console.error("Error creating payout request:", error)
    return { success: false, message: "Errore durante la creazione della richiesta." }
  }

  revalidatePath("/dashboard/operator/earnings")
  return { success: true, message: "Richiesta di pagamento inviata con successo." }
}

// Funzioni per l'Admin

export async function getAdminPayoutRequests(): Promise<PayoutRequestWithDetails[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("payout_requests")
    .select(
      `
      id,
      amount,
      status,
      requested_at,
      operator:profiles!payout_requests_operator_id_fkey(stage_name, email),
      method:operator_payout_methods(method_type, details)
    `,
    )
    .order("requested_at", { ascending: true })

  if (error) {
    console.error("Error fetching admin payout requests:", error)
    return []
  }
  return data
}

export async function processPayoutRequest(requestId: string, adminId: string, action: "complete" | "reject") {
  const supabase = createClient()

  const status = action === "complete" ? "completed" : "rejected"

  const { error } = await supabase
    .from("payout_requests")
    .update({
      status: status,
      processed_at: new Date().toISOString(),
      admin_processor_id: adminId,
    })
    .eq("id", requestId)

  if (error) {
    console.error(`Error ${action}ing payout request:`, error)
    return { success: false, message: "Errore durante l'aggiornamento della richiesta." }
  }

  revalidatePath("/admin/payouts")
  return { success: true, message: `Richiesta marcata come ${status}.` }
}
