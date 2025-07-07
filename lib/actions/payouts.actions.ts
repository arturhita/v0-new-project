"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getOperatorEarningsSummary(operatorId: string) {
  const supabase = createClient()
  const { data, error } = await supabase.rpc("get_operator_earnings_summary", { p_operator_id: operatorId }).single()
  if (error) {
    console.error("Error fetching earnings summary:", error)
    return { total_earnings: 0, pending_payout: 0, last_payout_amount: 0, last_payout_date: null }
  }
  return data
}

export async function getOperatorPayoutMethods(operatorId: string) {
  const supabase = createClient()
  const { data, error } = await supabase.from("payout_methods").select("*").eq("operator_id", operatorId)
  if (error) return []
  return data
}

export async function saveOperatorPayoutMethod(userId: string, formData: FormData) {
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
    return { success: false, message: "Metodo non valido." }
  }

  if (isDefault) {
    await supabase.from("payout_methods").update({ is_default: false }).eq("operator_id", userId)
  }

  const { error } = await supabase.from("payout_methods").insert({
    operator_id: userId,
    method_type: methodType,
    details: details,
    is_default: isDefault,
  })

  if (error) return { success: false, message: "Errore salvataggio metodo." }
  revalidatePath("/dashboard/operator/payout-settings")
  return { success: true, message: "Metodo di pagamento salvato." }
}

export async function getCommissionRequests(operatorId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("commission_requests")
    .select("*")
    .eq("operator_id", operatorId)
    .order("created_at", { ascending: false })
  if (error) return []
  return data
}

export async function submitCommissionRequest(formData: FormData) {
  const supabase = createClient()
  const requestData = {
    operator_id: formData.get("operator_id") as string,
    current_commission_rate: Number(formData.get("current_commission_rate")),
    requested_commission_rate: Number(formData.get("requested_commission_rate")),
    reason: formData.get("reason") as string,
  }
  const { error } = await supabase.from("commission_requests").insert(requestData)
  if (error) return { success: false, message: "Errore invio richiesta." }
  revalidatePath("/dashboard/operator/commission-request")
  return { success: true, message: "Richiesta inviata." }
}
