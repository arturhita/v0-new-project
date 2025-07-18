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
      payment_details,
      created_at,
      operator:profiles (
        id,
        stage_name
      )
    `,
    )
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching payout requests:", error)
    return []
  }
  // @ts-ignore
  return data.map((req) => ({ ...req, operatorName: req.operator.stage_name, operatorId: req.operator.id }))
}

export async function updatePayoutStatus(payoutId: string, newStatus: "processing" | "paid" | "rejected" | "on_hold") {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from("payout_requests")
    .update({ status: newStatus, processed_at: new Date().toISOString() })
    .eq("id", payoutId)

  if (error) {
    console.error("Error updating payout status:", error)
    return { success: false, message: "Errore nell'aggiornare lo stato del pagamento." }
  }

  revalidatePath("/admin/payouts")
  return { success: true, message: "Stato del pagamento aggiornato." }
}
