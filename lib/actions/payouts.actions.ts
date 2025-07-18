"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getPayoutRequests() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("payout_requests")
    .select(
      `
      id,
      created_at,
      amount,
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
    console.error("Error fetching payout requests:", error)
    return []
  }

  return data
}

export async function updatePayoutStatus(id: string, status: "completed" | "rejected") {
  const supabase = createClient()
  const { error } = await supabase.from("payout_requests").update({ status }).eq("id", id)

  if (error) {
    console.error("Error updating payout status:", error)
    return { success: false, message: "Impossibile aggiornare lo stato." }
  }

  revalidatePath("/admin/payouts")
  return { success: true, message: "Stato del pagamento aggiornato." }
}
