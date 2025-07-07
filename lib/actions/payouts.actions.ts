"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import type { PayoutMethod } from "@/types/database.types"

// Funzioni per l'Operatore

export async function getOperatorEarnings(operatorId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .rpc("get_operator_earnings_details", {
      p_operator_id: operatorId,
    })
    .single()

  if (error) {
    console.error("Error fetching operator earnings:", error)
    return null
  }
  return data
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

export async function requestPayout(operatorId: string) {
  const supabase = createClient()

  const today = new Date().getDate()
  if (!((today >= 1 && today <= 5) || (today >= 16 && today <= 20))) {
    return {
      error: "Le richieste di pagamento possono essere effettuate solo dal 1 al 5 e dal 16 al 20 di ogni mese.",
    }
  }

  const { data: earningsData, error: balanceError } = await supabase
    .rpc("get_operator_earnings_details", { p_operator_id: operatorId })
    .single()

  if (balanceError || !earningsData) {
    console.error("Error fetching balance for payout:", balanceError)
    return { error: "Impossibile calcolare il saldo." }
  }

  const balance = earningsData.balance

  if (balance <= 0) {
    return { error: "Il saldo è insufficiente per richiedere un pagamento." }
  }

  const { data: existingRequest } = await supabase
    .from("payout_requests")
    .select("id")
    .eq("operator_id", operatorId)
    .eq("status", "pending")
    .single()

  if (existingRequest) {
    return { error: "Hai già una richiesta di pagamento in sospeso." }
  }

  const { error: requestError } = await supabase.from("payout_requests").insert({
    operator_id: operatorId,
    amount: balance,
    status: "pending",
  })

  if (requestError) {
    console.error("Error creating payout request:", requestError)
    return {
      error: "Si è verificato un errore durante la creazione della richiesta.",
    }
  }

  revalidatePath("/dashboard/operator/earnings")
  revalidatePath("/admin/payouts")

  return { success: "Richiesta di pagamento inviata con successo." }
}
