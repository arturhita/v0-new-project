"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getOperatorEarnings(operatorId: string) {
  const supabase = createClient()
  const { data, error } = await supabase.rpc("get_operator_financials", { p_operator_id: operatorId }).single()

  if (error) {
    console.error("Error fetching operator financials:", error)
    return null
  }

  return data
}

export async function requestPayout(operatorId: string) {
  const supabase = createClient()

  const { data: financials } = await supabase.rpc("get_operator_financials", { p_operator_id: operatorId }).single()
  if (!financials || financials.balance <= 0) {
    return { success: false, message: "Nessun saldo disponibile per il ritiro." }
  }

  const { data: payoutMethod, error: methodError } = await supabase
    .from("operator_payout_methods")
    .select("id")
    .eq("operator_id", operatorId)
    .eq("is_primary", true)
    .single()

  if (methodError || !payoutMethod) {
    return {
      success: false,
      message: "Metodo di pagamento primario non trovato. Impostane uno prima di richiedere un pagamento.",
    }
  }

  const { error } = await supabase.from("payout_requests").insert({
    operator_id: operatorId,
    amount: financials.balance,
    status: "pending",
    payout_method_id: payoutMethod.id,
  })

  if (error) {
    console.error("Error creating payout request:", error)
    return { success: false, message: "Errore durante la creazione della richiesta di pagamento." }
  }

  revalidatePath("/dashboard/operator/earnings")
  revalidatePath("/admin/payouts")
  return { success: true, message: "Richiesta di pagamento inviata con successo." }
}
