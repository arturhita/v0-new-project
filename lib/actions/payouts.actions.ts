"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export async function getPayoutRequests() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("payout_requests")
    .select(
      `
      id,
      operator_id,
      amount,
      status,
      created_at,
      profiles (
        username
      )
    `,
    )
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching payout requests:", error)
    return []
  }
  return data
}

export async function updatePayoutStatus(id: string, status: "completed" | "rejected") {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from("payout_requests")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)

  if (error) {
    console.error("Error updating payout status:", error)
    return { error: "Impossibile aggiornare lo stato del pagamento." }
  }

  revalidatePath("/admin/payouts")
  return { success: true }
}
