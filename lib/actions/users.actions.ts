"use server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function getUsersWithStats() {
  const supabase = createAdminClient()
  const { data, error } = await supabase.rpc("get_users_with_stats")
  if (error) throw error
  return data
}

export async function toggleUserSuspension(userId: string, isSuspended: boolean) {
  const supabase = createAdminClient()
  const { error } = await supabase.from("users").update({ is_suspended: !isSuspended }).eq("id", userId)
  if (error) throw error
}

export async function issueVoucher(userId: string, amount: number) {
  // Implementation
}

export async function issueRefund(transactionId: string) {
  // Implementation
}
