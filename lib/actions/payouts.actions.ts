"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getPayoutSettings(operatorId: string) {
  const supabase = createClient()
  const { data, error } = await supabase.from("payout_settings").select("*").eq("operator_id", operatorId).single()

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching payout settings:", error)
  }
  return data
}

export async function savePayoutSettings(operatorId: string, prevState: any, formData: FormData) {
  const supabase = createClient()
  const settingsData = {
    operator_id: operatorId,
    payout_method: formData.get("payout_method") as string,
    paypal_email: formData.get("paypal_email") as string,
    bank_account_holder: formData.get("bank_account_holder") as string,
    iban: formData.get("iban") as string,
    swift_bic: formData.get("swift_bic") as string,
  }

  const { error } = await supabase.from("payout_settings").upsert(settingsData, { onConflict: "operator_id" })

  if (error) {
    return { success: false, message: `Error saving settings: ${error.message}` }
  }

  revalidatePath("/(platform)/dashboard/operator/payout-settings")
  return { success: true, message: "Impostazioni di pagamento salvate." }
}

export async function requestCommissionChange(operatorId: string, prevState: any, formData: FormData) {
  const supabase = createClient()

  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("commission_rate")
    .eq("id", operatorId)
    .single()
  if (!currentProfile) return { success: false, message: "Profilo non trovato." }

  const requestData = {
    operator_id: operatorId,
    current_commission_rate: currentProfile.commission_rate,
    requested_commission_rate: Number(formData.get("requested_rate")),
    reason: formData.get("reason") as string,
  }

  const { error } = await supabase.from("commission_requests").insert(requestData)

  if (error) {
    return { success: false, message: `Errore nell'invio della richiesta: ${error.message}` }
  }

  return { success: true, message: "Richiesta di modifica commissione inviata con successo." }
}
