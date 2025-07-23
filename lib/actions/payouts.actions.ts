"use server"
import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export async function getPayoutRequests() {
  const supabase = createAdminClient()
  const { data, error } = await supabase.from("payouts").select("*, profiles(full_name)")
  if (error) {
    console.error("Error fetching payout requests:", error)
    return []
  }
  return data
}

export async function updatePayoutStatus(id: string, status: "completed" | "rejected") {
  const supabase = createAdminClient()
  const { error } = await supabase.from("payouts").update({ status }).eq("id", id)
  if (error) {
    console.error("Error updating payout status:", error)
    return { success: false, error }
  }
  revalidatePath("/admin/payouts")
  return { success: true }
}
