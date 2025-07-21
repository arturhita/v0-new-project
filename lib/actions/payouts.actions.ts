"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export async function getPendingPayouts() {
  const supabaseAdmin = createAdminClient()
  const { data, error } = await supabaseAdmin
    .from("payouts")
    .select(
      `
      id,
      amount,
      status,
      requested_at,
      profiles (
        full_name,
        email
      )
    `,
    )
    .eq("status", "pending")
    .order("requested_at", { ascending: true })

  if (error) {
    console.error("Error fetching pending payouts:", error)
    return []
  }
  return data
}

export async function processPayout(payoutId: string) {
  const supabaseAdmin = createAdminClient()
  const { error } = await supabaseAdmin
    .from("payouts")
    .update({ status: "completed", processed_at: new Date().toISOString() })
    .eq("id", payoutId)

  if (error) {
    console.error("Error processing payout:", error)
    return { success: false, message: error.message }
  }

  revalidatePath("/admin/payouts")
  return { success: true, message: "Pagamento processato con successo." }
}
