"use server"
import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export async function getUsersWithStats() {
  const supabase = createAdminClient()
  const { data, error } = await supabase.rpc("get_users_with_stats")
  if (error) {
    console.error("Error fetching users with stats:", error)
    return []
  }
  return data
}

export async function toggleUserSuspension(userId: string, isSuspended: boolean) {
  const supabase = createAdminClient()
  const { error } = await supabase.from("profiles").update({ is_suspended: !isSuspended }).eq("id", userId)
  if (error) return { success: false, error }
  revalidatePath("/admin/users")
  return { success: true }
}

export async function issueVoucher(userId: string, amount: number) {
  const supabase = createAdminClient()
  // Placeholder logic
  console.log(`Issuing voucher of ${amount} to user ${userId}`)
  return { success: true }
}

export async function issueRefund(transactionId: string) {
  const supabase = createAdminClient()
  // Placeholder logic
  console.log(`Issuing refund for transaction ${transactionId}`)
  return { success: true }
}
