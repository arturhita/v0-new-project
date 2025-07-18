"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getCommissionRequests() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("commission_increase_requests")
    .select(
      `
      id,
      created_at,
      requested_rate,
      current_rate,
      reason,
      status,
      operator_id,
      profiles (
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

export async function updateCommissionRequestStatus(id: string, status: "approved" | "rejected") {
  const supabase = createClient()

  if (status === "approved") {
    const { data: request, error: fetchError } = await supabase
      .from("commission_increase_requests")
      .select("operator_id, requested_rate")
      .eq("id", id)
      .single()

    if (fetchError || !request) {
      console.error("Error fetching request to approve:", fetchError)
      return { success: false, message: "Impossibile trovare la richiesta da approvare." }
    }

    const { error: profileUpdateError } = await supabase
      .from("profiles")
      .update({ commission_rate: request.requested_rate })
      .eq("id", request.operator_id)

    if (profileUpdateError) {
      console.error("Error updating profile commission:", profileUpdateError)
      return { success: false, message: "Impossibile aggiornare la commissione del profilo." }
    }
  }

  const { error } = await supabase
    .from("commission_increase_requests")
    .update({ status, processed_at: new Date().toISOString() })
    .eq("id", id)

  if (error) {
    console.error("Error updating commission request status:", error)
    return { success: false, message: "Impossibile aggiornare la richiesta." }
  }

  revalidatePath("/admin/commission-requests")
  return { success: true, message: "Richiesta aggiornata." }
}
