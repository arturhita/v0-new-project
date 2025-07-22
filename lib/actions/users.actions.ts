"use server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export async function getUsersWithStats() {
  const { data, error } = await supabaseAdmin.rpc("get_users_with_stats")
  if (error) {
    console.error("Error fetching users with stats:", error)
    return []
  }
  return data
}

export async function toggleUserSuspension(userId: string, isSuspended: boolean) {
  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    user_metadata: { suspended: !isSuspended },
  })
  if (error) return { error: error.message }
  revalidatePath("/admin/users")
  return { success: true }
}

export async function issueVoucher(userId: string, amount: number) {
  // Placeholder for voucher logic
  console.log(`Issuing voucher of ${amount} to user ${userId}`)
  return { success: `Voucher of ${amount} issued.` }
}

export async function issueRefund(transactionId: string) {
  // Placeholder for refund logic
  console.log(`Issuing refund for transaction ${transactionId}`)
  return { success: `Refund for transaction ${transactionId} processed.` }
}
