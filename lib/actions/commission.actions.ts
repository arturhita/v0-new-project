"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { createSupabaseAdminClient } from "@/lib/supabase/admin"

export async function createCommissionRequest(operatorId: string, formData: FormData) {
  const supabase = createClient()

  const requestedRate = Number(formData.get("requested_rate"))
  const reason = formData.get("reason") as string

  if (isNaN(requestedRate) || requestedRate < 0 || requestedRate > 100) {
    return { success: false, message: "La percentuale richiesta non è valida." }
  }

  // Get current rate
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("commission_rate")
    .eq("id", operatorId)
    .single()

  if (profileError || !profile) {
    return { success: false, message: "Impossibile trovare il profilo operatore." }
  }

  const { error } = await supabase.from("commission_requests").insert({
    operator_id: operatorId,
    current_rate: profile.commission_rate || 0,
    requested_rate: requestedRate,
    reason: reason,
  })

  if (error) {
    console.error("Error creating commission request:", error)
    return { success: false, message: "Errore durante l'invio della richiesta." }
  }

  revalidatePath("/dashboard/operator/commission-request")
  return { success: true, message: "Richiesta inviata con successo." }
}

export async function getOperatorCommissionRequests(operatorId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("commission_requests")
    .select("*")
    .eq("operator_id", operatorId)
    .order("requested_at", { ascending: false })

  if (error) {
    console.error("Error fetching commission requests:", error)
    return []
  }
  return data
}

// --- Admin Actions ---

export async function getAdminCommissionRequests() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("commission_requests")
    .select("*, operator:profiles(stage_name, email)")
    .order("requested_at", { ascending: true })

  if (error) {
    console.error("Error fetching admin commission requests:", error)
    return []
  }
  return data
}

export async function processCommissionRequest(
  requestId: string,
  operatorId: string,
  newRate: number,
  action: "approve" | "reject",
  rejectionReason?: string,
) {
  const supabaseAdmin = createSupabaseAdminClient()
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { success: false, message: "Accesso non autorizzato." }

  if (action === "approve") {
    // 1. Update profile with new commission rate
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({ commission_rate: newRate })
      .eq("id", operatorId)

    if (profileError) {
      return { success: false, message: `Errore aggiornamento profilo: ${profileError.message}` }
    }

    // 2. Update request status
    const { error: requestError } = await supabaseAdmin
      .from("commission_requests")
      .update({ status: "approved", processed_at: new Date().toISOString(), admin_processor_id: user.id })
      .eq("id", requestId)

    if (requestError) {
      return { success: false, message: `Errore aggiornamento richiesta: ${requestError.message}` }
    }
  } else {
    // Action is "reject"
    const { error: requestError } = await supabaseAdmin
      .from("commission_requests")
      .update({
        status: "rejected",
        processed_at: new Date().toISOString(),
        admin_processor_id: user.id,
        rejection_reason: rejectionReason,
      })
      .eq("id", requestId)

    if (requestError) {
      return { success: false, message: `Errore rifiuto richiesta: ${requestError.message}` }
    }
  }

  revalidatePath("/admin/commission-requests")
  revalidatePath("/dashboard/operator/commission-request")
  return { success: true, message: `Richiesta ${action === "approve" ? "approvata" : "rifiutata"}.` }
}
