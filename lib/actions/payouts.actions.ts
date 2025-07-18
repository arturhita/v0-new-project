"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getPayoutRequests() {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from("payout_requests")
    .select(`
      id,
      amount,
      status,
      created_at,
      processed_at,
      profiles (
        id,
        username,
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

export async function updatePayoutStatus(id: string, status: "completed" | "rejected") {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from("payout_requests")
    .update({ status, processed_at: new Date().toISOString() })
    .eq("id", id)
    .select()

  if (error) {
    console.error("Error updating payout status:", error)
    return { success: false, message: error.message }
  }

  revalidatePath("/admin/payouts")
  return { success: true, message: `Payout ${status}.` }
}
