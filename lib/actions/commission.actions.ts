"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export async function getCommissionRequests() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("commission_requests")
    .select(
      `
      id,
      current_rate,
      requested_rate,
      justification,
      status,
      created_at,
      operator:profiles (
        id,
        stage_name
      )
    `,
    )
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching commission requests:", error)
    return []
  }

  // @ts-ignore - Supabase TS inference can be tricky with nested selects
  return data.map((req) => ({ ...req, operatorName: req.operator.stage_name, operatorId: req.operator.id }))
}

export async function handleCommissionRequest(requestId: string, newStatus: "approved" | "rejected") {
  const supabase = createAdminClient()

  const { data: request, error: fetchError } = await supabase
    .from("commission_requests")
    .select("operator_id, requested_rate")
    .eq("id", requestId)
    .single()

  if (fetchError || !request) {
    console.error("Commission request not found:", fetchError)
    return { success: false, message: "Richiesta non trovata." }
  }

  if (newStatus === "approved") {
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ commission_rate: request.requested_rate })
      .eq("id", request.operator_id) // CORREZIONE: usa 'id'

    if (profileError) {
      console.error("Error updating operator profile:", profileError)
      return { success: false, message: "Errore nell'aggiornare il profilo operatore." }
    }
  }

  const { error: updateError } = await supabase
    .from("commission_requests")
    .update({ status: newStatus, reviewed_at: new Date().toISOString() })
    .eq("id", requestId)

  if (updateError) {
    console.error("Error updating commission request status:", updateError)
    return { success: false, message: "Errore nell'aggiornare lo stato della richiesta." }
  }

  revalidatePath("/admin/commission-requests-log")
  return { success: true, message: `Richiesta ${newStatus === "approved" ? "approvata" : "rifiutata"}.` }
}
