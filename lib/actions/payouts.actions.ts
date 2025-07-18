"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import { unstable_noStore as noStore } from "next/cache"

export async function getPayoutRequests() {
  noStore()
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("payout_requests")
    .select(
      `
      id,
      amount,
      status,
      created_at,
      operator:profiles (
        id,
        full_name,
        email
      )
    `,
    )
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching payout requests:", error.message)
    return {
      error: `Errore nel caricamento delle richieste di pagamento: ${error.message}`,
    }
  }

  return { data }
}

export async function updatePayoutStatus(payoutId: string, newStatus: "processing" | "paid" | "rejected" | "on_hold") {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from("payout_requests")
    .update({ status: newStatus, processed_at: new Date().toISOString() })
    .eq("id", payoutId)

  if (error) {
    console.error("Error updating payout status:", error)
    return { error: "Impossibile aggiornare lo stato del pagamento." }
  }

  revalidatePath("/admin/payouts")
  return { success: "Stato del pagamento aggiornato con successo." }
}
