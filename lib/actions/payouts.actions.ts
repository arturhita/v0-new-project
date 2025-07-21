"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function getPayoutRequests() {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("payouts")
    .select(`
      *,
      operator:profiles!payouts_operator_id_fkey(stage_name, full_name)
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching payout requests:", error)
    return []
  }

  return data || []
}

export async function updatePayoutStatus(payoutId: string, status: "approved" | "rejected", adminNotes?: string) {
  const supabase = createAdminClient()

  try {
    const { data, error } = await supabase
      .from("payouts")
      .update({
        status,
        admin_notes: adminNotes,
        processed_at: new Date().toISOString(),
      })
      .eq("id", payoutId)
      .select()
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error("Error updating payout status:", error)
    return { success: false, error: "Failed to update payout" }
  }
}
