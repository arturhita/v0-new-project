"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

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

export async function requestPayout(operatorId: string) {
  const supabase = createClient()

  // 1. Check if payout window is open
  const today = new Date().getDate()
  if (!((today >= 1 && today <= 5) || (today >= 16 && today <= 20))) {
    return {
      error: "Le richieste di pagamento possono essere effettuate solo dal 1 al 5 e dal 16 al 20 di ogni mese.",
    }
  }

  // 2. Get current balance from a secure RPC call
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

  // 3. Check for existing pending requests
  const { data: existingRequest, error: existingRequestError } = await supabase
    .from("payout_requests")
    .select("id")
    .eq("operator_id", operatorId)
    .eq("status", "pending")
    .single()

  if (existingRequest) {
    return { error: "Hai già una richiesta di pagamento in sospeso." }
  }

  // 4. Create new payout request
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

export async function getPayoutRequests() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("payout_requests_view")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching payout requests:", error)
    return []
  }
  return data
}

export async function updatePayoutStatus(requestId: string, status: "completed" | "rejected") {
  const supabase = createClient()
  const { error } = await supabase
    .from("payout_requests")
    .update({ status, processed_at: new Date().toISOString() })
    .eq("id", requestId)

  if (error) {
    console.error("Error updating payout status:", error)
    return { error: "Errore durante l'aggiornamento dello stato." }
  }

  revalidatePath("/admin/payouts")
  return { success: "Stato aggiornato con successo." }
}

export async function getCommissionRequests() {
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

export async function requestCommissionChange(operatorId: string, formData: FormData) {
  const supabase = createClient()
  const newRate = Number.parseFloat(formData.get("new_rate") as string)
  const reason = formData.get("reason") as string

  if (isNaN(newRate) || newRate < 0 || newRate > 100) {
    return { error: "Percentuale non valida." }
  }

  const { error } = await supabase.from("commission_requests").insert({
    operator_id: operatorId,
    requested_rate: newRate,
    reason: reason,
    status: "pending",
  })

  if (error) {
    console.error("Error creating commission request:", error)
    return { error: "Errore durante l'invio della richiesta." }
  }

  revalidatePath("/dashboard/operator/commission-request")
  revalidatePath("/admin/commission-requests")
  return { success: "Richiesta inviata con successo." }
}

export async function updateCommissionRate(requestId: string, operatorId: string, newRate: number) {
  const supabase = createClient()

  const { error: profileError } = await supabase
    .from("operator_profiles")
    .update({ commission_rate: newRate })
    .eq("profile_id", operatorId)

  if (profileError) {
    console.error("Error updating commission rate:", profileError)
    return { error: "Errore durante l'aggiornamento della commissione." }
  }

  const { error: requestError } = await supabase
    .from("commission_requests")
    .update({ status: "approved" })
    .eq("id", requestId)

  if (requestError) {
    // Log this, but don't fail the whole operation since the rate was updated
    console.error("Error updating commission request status:", requestError)
  }

  revalidatePath("/admin/commission-requests")
  revalidatePath(`/admin/operators/${operatorId}/edit`)
  return { success: "Commissione aggiornata." }
}

export async function rejectCommissionRequest(requestId: string) {
  const supabase = createClient()
  const { error } = await supabase.from("commission_requests").update({ status: "rejected" }).eq("id", requestId)

  if (error) {
    console.error("Error rejecting commission request:", error)
    return { error: "Errore durante il rifiuto della richiesta." }
  }

  revalidatePath("/admin/commission-requests")
  return { success: "Richiesta rifiutata." }
}
