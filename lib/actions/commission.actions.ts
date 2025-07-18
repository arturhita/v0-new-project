"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export async function getCommissionRequests() {
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
        username,
        full_name
      )
    `,
    )
    .eq("status", "pending")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching commission requests:", error)
    throw new Error("Impossibile caricare le richieste di commissione.")
  }
  return data
}

export async function updateCommissionRequestStatus(
  requestId: string,
  operatorId: string,
  newRate: number,
  newStatus: "approved" | "rejected",
) {
  const supabase = createAdminClient()

  // Step 1: Update the request status
  const { error: requestError } = await supabase
    .from("commission_increase_requests")
    .update({ status: newStatus, processed_at: new Date().toISOString() })
    .eq("id", requestId)

  if (requestError) {
    console.error("Error updating commission request:", requestError)
    return { error: "Impossibile aggiornare la richiesta." }
  }

  // Step 2: If approved, update the operator's profile
  if (newStatus === "approved") {
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ commission_rate: newRate })
      .eq("id", operatorId)

    if (profileError) {
      console.error("Error updating operator commission rate:", profileError)
      // Potentially roll back the request status update here
      return { error: "Impossibile aggiornare il profilo dell'operatore." }
    }
  }

  revalidatePath("/admin/commission-requests")
  return { success: true }
}
