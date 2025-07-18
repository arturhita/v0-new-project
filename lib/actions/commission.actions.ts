"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getCommissionRequests() {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from("commission_increase_requests")
    .select(`
      id,
      current_rate,
      requested_rate,
      reason,
      status,
      created_at,
      profiles (
        id,
        username,
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
  const supabase = createServerClient()

  // TODO: If approved, update the operator's commission rate in the profiles table.
  // This requires a transaction or a more complex serverless function.
  // For now, we just update the status.

  const { data, error } = await supabase
    .from("commission_increase_requests")
    .update({ status, processed_at: new Date().toISOString() })
    .eq("id", id)

  if (error) {
    console.error("Error updating commission request:", error)
    return { success: false, message: error.message }
  }

  revalidatePath("/admin/commission-requests")
  return { success: true, message: `Richiesta ${status}.` }
}
