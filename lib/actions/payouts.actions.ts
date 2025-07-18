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
    console.error("Error fetching payout requests:", error)
    return { error: "Impossibile caricare le richieste di pagamento." }
  }
  return { data }
}

export async function updatePayoutRequestStatus(requestId: string, newStatus: "approved" | "rejected") {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from("payout_requests")
    .update({ status: newStatus, processed_at: new Date().toISOString() })
    .eq("id", requestId)

  if (error) {
    console.error("Error updating payout status:", error)
    return { error: "Impossibile aggiornare lo stato della richiesta." }
  }

  revalidatePath("/admin/payouts")
  return { success: `Richiesta di pagamento ${newStatus === "approved" ? "approvata" : "rifiutata"}.` }
}
