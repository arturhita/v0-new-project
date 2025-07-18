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
      requested_percentage,
      current_percentage,
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
  const { error } = await supabase.from("commission_increase_requests").update({ status }).eq("id", id)

  if (error) {
    console.error("Error updating commission request status:", error)
    return { success: false, message: "Impossibile aggiornare la richiesta." }
  }

  revalidatePath("/admin/commission-requests")
  return { success: true, message: "Richiesta aggiornata." }
}
