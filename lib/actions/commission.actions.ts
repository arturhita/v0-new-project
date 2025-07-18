"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getCommissionRequests() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("commission_increase_requests")
    .select(`
      *,
      profiles (
        full_name,
        email
      )
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching commission requests:", error)
    return []
  }
  return data
}

export async function updateCommissionRequestStatus(id: string, status: "approved" | "rejected") {
  const supabase = createClient()

  // If approved, update the operator's commission rate in the profiles table.
  // This requires a bit more logic to fetch the request, get the operator_id and new_rate,
  // and then update the profiles table. For now, we just update the request status.

  const { data: request, error: requestError } = await supabase
    .from("commission_increase_requests")
    .select("operator_id, requested_commission_rate")
    .eq("id", id)
    .single()

  if (requestError) {
    console.error("Error fetching commission request:", requestError)
    return { success: false, message: "Errore durante il recupero della richiesta." }
  }

  const { error } = await supabase
    .from("commission_increase_requests")
    .update({ status, reviewed_at: new Date().toISOString() })
    .eq("id", id)

  if (error) {
    console.error("Error updating commission request:", error)
    return { success: false, message: "Errore durante l'aggiornamento della richiesta." }
  }

  if (status === "approved") {
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ commission_rate: request.requested_commission_rate })
      .eq("id", request.operator_id)

    if (updateError) {
      console.error("Error updating operator's commission rate:", updateError)
      return { success: false, message: "Errore durante l'aggiornamento del tasso di commissione dell'operatore." }
    }
  }

  revalidatePath("/admin/commission-requests")
  return { success: true, message: `Richiesta ${status} con successo.` }
}
