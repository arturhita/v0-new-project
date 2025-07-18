"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import { unstable_noStore as noStore } from "next/cache"

export async function getCommissionRequests() {
  noStore()
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
        full_name,
        email
      )
    `,
    )
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching commission requests:", error)
    return { error: "Impossibile caricare le richieste di commissione." }
  }
  return { data }
}

export async function updateCommissionRequestStatus(requestId: string, newStatus: "approved" | "rejected") {
  const supabase = createAdminClient()

  // If approved, we also need to update the operator's profile
  if (newStatus === "approved") {
    const { data: requestData, error: requestError } = await supabase
      .from("commission_requests")
      .select("operator_id, requested_rate")
      .eq("id", requestId)
      .single()

    if (requestError || !requestData) {
      return { error: "Richiesta non trovata." }
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .update({ commission_rate: requestData.requested_rate })
      .eq("id", requestData.operator_id)

    if (profileError) {
      return { error: "Impossibile aggiornare la commissione dell'operatore." }
    }
  }

  const { error } = await supabase
    .from("commission_requests")
    .update({ status: newStatus, reviewed_at: new Date().toISOString() })
    .eq("id", requestId)

  if (error) {
    return { error: "Impossibile aggiornare lo stato della richiesta." }
  }

  revalidatePath("/admin/commission-requests-log")
  return { success: `Richiesta ${newStatus === "approved" ? "approvata" : "rifiutata"} con successo.` }
}
