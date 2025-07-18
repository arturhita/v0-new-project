"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getPayoutRequests() {
  const supabase = createClient()
  try {
    // Explicit join to avoid schema cache issues
    const { data, error } = await supabase
      .from("payout_requests")
      .select(
        `
        id,
        operator_id,
        amount,
        status,
        created_at,
        processed_at,
        profiles (
          id,
          username,
          email
        )
      `,
      )
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching payout requests:", error.message)
      throw new Error(`Could not fetch payout requests: ${error.message}`)
    }

    // The data is already in the desired shape because of the explicit select.
    return data
  } catch (error: any) {
    console.error("Catch block error fetching payout requests:", error.message)
    return { error: error.message }
  }
}

export async function updatePayoutStatus(id: string, status: "completed" | "rejected") {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("payout_requests")
    .update({ status: status, processed_at: new Date().toISOString() })
    .eq("id", id)
    .select()

  if (error) {
    return { error: "Impossibile aggiornare lo stato della richiesta." }
  }

  revalidatePath("/admin/payouts")
  return { success: "Stato aggiornato con successo." }
}
