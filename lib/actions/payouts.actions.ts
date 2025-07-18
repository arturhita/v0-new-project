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
      amount,
      status,
      created_at,
      processed_at,
      operator:profiles (
        id,
        username,
        full_name,
        avatar_url
      )
    `,
    )
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching payout requests:", error)
    throw new Error("Impossibile caricare le richieste di pagamento. " + error.message)
  }
  return data
}

export async function updatePayoutStatus(payoutId: string, newStatus: "completed" | "rejected") {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("payout_requests")
    .update({ status: newStatus, processed_at: new Date().toISOString() })
    .eq("id", payoutId)
    .select()
    .single()

  if (error) {
    console.error("Error updating payout status:", error)
    return { error: "Impossibile aggiornare lo stato del pagamento." }
  }

  revalidatePath("/admin/payouts")
  return { success: true, data }
}
