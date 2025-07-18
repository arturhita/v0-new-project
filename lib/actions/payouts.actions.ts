"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getPayoutRequests() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("payout_requests")
    .select(`
      *,
      profiles (
        full_name,
        email
      )
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching payout requests:", error)
    return []
  }
  return data
}

export async function updatePayoutRequestStatus(id: string, status: "completed" | "rejected") {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("payout_requests")
    .update({ status, processed_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating payout request status:", error)
    return { success: false, message: "Errore durante l'aggiornamento della richiesta." }
  }

  revalidatePath("/admin/payouts")
  return { success: true, message: `Richiesta ${status === "completed" ? "approvata" : "rifiutata"} con successo.` }
}
