"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import { unstable_noStore as noStore } from "next/cache"

export async function getPayoutRequests() {
  noStore()
  const supabase = createAdminClient()
  // The relationship is now fixed via the foreign key on operator_id.
  // The query can now reliably join profiles.
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
    // Provide a more user-friendly error message
    return {
      error:
        "Errore nel caricamento delle richieste di pagamento. La relazione con i profili potrebbe essere mancante.",
    }
  }

  return { data }
}

export async function processPayout(requestId: string, newStatus: "completed" | "rejected") {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("payout_requests")
    .update({ status: newStatus, processed_at: new Date().toISOString() })
    .eq("id", requestId)
    .select()

  if (error) {
    console.error("Error processing payout:", error)
    return { error: "Impossibile elaborare la richiesta di pagamento." }
  }

  revalidatePath("/admin/payouts")
  return { success: "Stato del pagamento aggiornato con successo." }
}
