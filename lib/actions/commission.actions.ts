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
    return []
  }
  return data
}

export async function updateCommissionRequestStatus(
  requestId: string,
  newStatus: "approved" | "rejected",
  operatorId?: string,
  newRate?: number,
) {
  const supabase = createAdminClient()

  // If approved, first update the operator's commission rate in the profiles table
  if (newStatus === "approved" && operatorId && newRate) {
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ commission_rate: newRate })
      .eq("id", operatorId)

    if (profileError) {
      return { error: `Errore durante l'aggiornamento della commissione dell'operatore: ${profileError.message}` }
    }
  }

  // Then, update the status of the request
  const { error: requestError } = await supabase
    .from("commission_increase_requests")
    .update({ status: newStatus, processed_at: new Date().toISOString() })
    .eq("id", requestId)

  if (requestError) {
    return { error: `Errore durante l'aggiornamento dello stato della richiesta: ${requestError.message}` }
  }

  revalidatePath("/admin/commission-requests")
  return { success: `Richiesta ${newStatus === "approved" ? "approvata" : "rifiutata"} con successo.` }
}
