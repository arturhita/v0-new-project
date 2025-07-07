"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { createSupabaseAdminClient } from "../supabase/admin"

export async function getOperatorEarningsDetails(operatorId: string) {
  const supabase = createClient()
  const { data, error } = await supabase.rpc("get_operator_earnings_details", { p_operator_id: operatorId }).single()

  if (error) {
    console.error("Error fetching earnings details:", error)
    return { balance: 0, total_earned: 0, total_withdrawn: 0, transactions: [] }
  }
  return data
}

export async function getOperatorPayoutMethods(operatorId: string) {
  const supabase = createClient()
  const { data, error } = await supabase.from("operator_payout_methods").select("*").eq("operator_id", operatorId)
  if (error) {
    console.error("Error fetching payout methods:", error)
    return []
  }
  return data
}

export async function savePayoutMethod(operatorId: string, formData: FormData) {
  const supabase = createClient()
  const methodType = formData.get("method_type") as string
  let details = {}

  if (methodType === "paypal") {
    details = { email: formData.get("paypal_email") }
  } else if (methodType === "bank_account") {
    details = {
      account_holder: formData.get("account_holder"),
      iban: formData.get("iban"),
      bank_name: formData.get("bank_name"),
    }
  } else {
    return { success: false, message: "Metodo di pagamento non valido." }
  }

  const { error } = await supabase.from("operator_payout_methods").insert({
    operator_id: operatorId,
    method_type: methodType,
    details: details,
    is_primary: true, // Simplified: always set as primary for now
  })

  if (error) {
    console.error("Error saving payout method:", error)
    return { success: false, message: "Errore durante il salvataggio del metodo di pagamento." }
  }

  revalidatePath("/dashboard/operator/payout-settings")
  return { success: true, message: "Metodo di pagamento salvato." }
}

export async function deletePayoutMethod(methodId: string) {
  const supabase = createClient()
  const { error } = await supabase.from("operator_payout_methods").delete().eq("id", methodId)
  if (error) {
    console.error("Error deleting payout method:", error)
    return { success: false, message: "Errore durante l'eliminazione." }
  }
  revalidatePath("/dashboard/operator/payout-settings")
  return { success: true, message: "Metodo di pagamento eliminato." }
}

export async function requestPayout(operatorId: string, amount: number, methodId: string) {
  const supabase = createClient()
  const { error } = await supabase.from("payout_requests").insert({
    operator_id: operatorId,
    amount: amount,
    payout_method_id: methodId,
    status: "pending",
  })

  if (error) {
    console.error("Error requesting payout:", error)
    return { success: false, message: "Errore durante la richiesta di pagamento." }
  }

  revalidatePath("/dashboard/operator/earnings")
  revalidatePath("/admin/payouts")
  return { success: true, message: "Richiesta di pagamento inviata." }
}

export async function getCommissionRequestsForAdmin() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("commission_requests_view")
    .select("*")
    .order("created_at", { ascending: false })
  if (error) {
    console.error("Error fetching commission requests:", error)
    return []
  }
  return data
}

export async function updateCommissionRequestStatus(
  requestId: string,
  status: "approved" | "rejected",
  adminNotes?: string,
) {
  const supabaseAdmin = await createSupabaseAdminClient()
  const { data: request, error: fetchError } = await supabaseAdmin
    .from("commission_requests")
    .select("operator_id, requested_commission_rate")
    .eq("id", requestId)
    .single()

  if (fetchError || !request) {
    return { success: false, message: "Richiesta non trovata." }
  }

  const { error: updateError } = await supabaseAdmin
    .from("commission_requests")
    .update({ status, admin_notes: adminNotes })
    .eq("id", requestId)

  if (updateError) {
    return { success: false, message: "Errore durante l'aggiornamento della richiesta." }
  }

  if (status === "approved") {
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({ commission_rate: request.requested_commission_rate })
      .eq("id", request.operator_id)

    if (profileError) {
      // Rollback status? For now, just log the error.
      console.error("Failed to update profile commission, but request status was changed:", profileError)
      return { success: false, message: "Commissione del profilo non aggiornata, ma richiesta approvata." }
    }
  }

  revalidatePath("/admin/commission-requests")
  return { success: true, message: `Richiesta ${status === "approved" ? "approvata" : "rifiutata"}.` }
}
