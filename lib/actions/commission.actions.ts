"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import { unstable_noStore as noStore } from "next/cache"

export async function getCommissionRequests() {
  noStore()
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("commission_increase_requests")
    .select(
      `
      id,
      current_commission,
      requested_commission,
      justification,
      status,
      created_at,
      profiles (
        id,
        full_name,
        username
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

  if (newStatus === "approved") {
    const { data: requestData, error: requestError } = await supabase
      .from("commission_increase_requests")
      .select("operator_id, requested_commission")
      .eq("id", requestId)
      .single()

    if (requestError || !requestData) {
      console.error("Error fetching request data:", requestError)
      return { error: "Richiesta non trovata." }
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .update({ commission_rate: requestData.requested_commission })
      .eq("id", requestData.operator_id)

    if (profileError) {
      console.error("Error updating profile commission:", profileError)
      return { error: "Impossibile aggiornare la commissione dell'operatore." }
    }
  }

  const { error } = await supabase
    .from("commission_increase_requests")
    .update({ status: newStatus, reviewed_at: new Date().toISOString() })
    .eq("id", requestId)

  if (error) {
    console.error("Error updating request status:", error)
    return { error: "Impossibile aggiornare lo stato della richiesta." }
  }

  revalidatePath("/admin/commission-requests")
  return { success: `Richiesta ${newStatus === "approved" ? "approvata" : "rifiutata"} con successo.` }
}
