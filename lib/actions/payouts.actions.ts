"use server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export async function getPayoutRequests() {
  const { data, error } = await supabaseAdmin
    .from("payouts")
    .select("*, profile:profiles(full_name, email)")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching payout requests:", error)
    return []
  }
  return data
}

export async function updatePayoutStatus(payoutId: string, status: "completed" | "rejected") {
  const { error } = await supabaseAdmin
    .from("payouts")
    .update({ status, processed_at: new Date().toISOString() })
    .eq("id", payoutId)

  if (error) {
    return { error: error.message }
  }
  revalidatePath("/admin/payouts")
  return { success: true }
}
