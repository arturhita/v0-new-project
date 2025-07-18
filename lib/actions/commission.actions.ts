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
      operator_id,
      current_commission_rate,
      requested_commission_rate,
      reason,
      status,
      created_at,
      profiles (
        username
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
  const supabase = createAdminClient()
  const { error } = await supabase
    .from("commission_increase_requests")
    .update({ status, reviewed_at: new Date().toISOString() })
    .eq("id", id)

  if (error) {
    console.error("Error updating commission request status:", error)
    return { error: "Impossibile aggiornare la richiesta." }
  }

  revalidatePath("/admin/commission-requests")
  return { success: true }
}
