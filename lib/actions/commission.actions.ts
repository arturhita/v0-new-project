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
        stage_name
      )
    `,
    )
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching commission requests:", error)
    return []
  }

  // @ts-ignore
  return data.map((req) => ({ ...req, operatorName: req.operator.stage_name }))
}

export async function handleCommissionRequest(requestId: string, newStatus: "approved" | "rejected") {
  const supabase = createAdminClient()

  // Recupera la richiesta per ottenere l'ID operatore e la nuova percentuale
  const { data: request, error: fetchError } = await supabase
    .from("commission_requests")
    .select("operator_id, requested_rate")
    .eq("id", requestId)
    .single()

  if (fetchError || !request) {
    return { success: false, message: "Richiesta non trovata." }
  }

  // Se approvata, aggiorna la commissione nel profilo dell'operatore
  if (newStatus === "approved") {
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ commission_rate: request.requested_rate })
      .eq("user_id", request.operator_id)

    if (profileError) {
      return { success: false, message: "Errore nell'aggiornare il profilo operatore." }
    }
  }

  // Aggiorna lo stato della richiesta
  const { error: updateError } = await supabase
    .from("commission_requests")
    .update({ status: newStatus, reviewed_at: new Date().toISOString() })
    .eq("id", requestId)

  if (updateError) {
    return { success: false, message: "Errore nell'aggiornare lo stato della richiesta." }
  }

  revalidatePath("/admin/commission-requests-log")
  return { success: true, message: `Richiesta ${newStatus === "approved" ? "approvata" : "rifiutata"}.` }
}
