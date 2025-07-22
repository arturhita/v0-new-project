"use server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export async function getPayoutRequests() {
  const { data, error } = await supabaseAdmin.from("payouts").select("*, profiles(full_name, email)")
  if (error) {
    console.error("Error fetching payout requests:", error)
    return []
  }
  return data
}

export async function updatePayoutStatus(payoutId: string, status: "completed" | "rejected", admin_notes: string) {
  const { error } = await supabaseAdmin
    .from("payouts")
    .update({ status, admin_notes, processed_at: new Date().toISOString() })
    .eq("id", payoutId)
  if (error) {
    console.error("Error updating payout status:", error)
    return { error: error.message }
  }
  revalidatePath("/admin/payouts")
  return { success: true }
}
