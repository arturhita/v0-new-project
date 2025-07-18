"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import { unstable_noStore as noStore } from "next/cache"

export async function getCommissionIncreaseRequests() {
  noStore()
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("commission_increase_requests")
    .select(
      `
      id,
      current_rate,
      requested_rate,
      reason,
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
    return { error: `Impossibile caricare le richieste: ${error.message}` }
  }
  return { data }
}

export async function updateCommissionRequestStatus(
  requestId: string,
  newStatus: "approved" | "rejected",
  operatorId?: string,
  newRate?: number,
) {
  const supabase = createAdminClient()

  if (newStatus === "approved") {
    if (!operatorId || newRate === undefined) {
      return { error: "Dati mancanti per approvare la richiesta." }
    }
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ commission_rate: newRate })
      .eq("id", operatorId)

    if (profileError) {
      return { error: `Impossibile aggiornare la commissione dell'operatore: ${profileError.message}` }
    }
  }

  const { error } = await supabase
    .from("commission_increase_requests")
    .update({ status: newStatus, processed_at: new Date().toISOString() })
    .eq("id", requestId)

  if (error) {
    return { error: "Impossibile aggiornare lo stato della richiesta." }
  }

  revalidatePath("/admin/commission-requests")
  return { success: `Richiesta ${newStatus === "approved" ? "approvata" : "rifiutata"} con successo.` }
}
