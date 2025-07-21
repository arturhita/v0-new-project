"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export type UserProfileWithStats = {
  id: string
  email: string | undefined
  full_name: string | null
  role: string | null
  created_at: string
  status: string | null
  total_spent: number
  total_consultations: number
  chat_sessions_as_client: any[]
  chat_sessions_as_operator: any[]
}

export async function getUsersWithStats() {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("profiles")
    .select(`
      *,
      chat_sessions_as_client:chat_sessions!chat_sessions_client_id_fkey(id),
      chat_sessions_as_operator:chat_sessions!chat_sessions_operator_id_fkey(id)
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching users with stats:", error)
    return []
  }

  return data || []
}

export async function toggleUserSuspension(userId: string, suspended: boolean) {
  const supabase = createAdminClient()

  try {
    const { data, error } = await supabase
      .from("profiles")
      .update({
        is_suspended: suspended,
        suspended_at: suspended ? new Date().toISOString() : null,
      })
      .eq("id", userId)
      .select()
      .single()

    if (error) throw error
    revalidatePath("/admin/users")
    return { success: true, data }
  } catch (error) {
    console.error("Error toggling user suspension:", error)
    return { success: false, error: "Failed to update user status" }
  }
}

export async function issueVoucher(userId: string, amount: number, description: string) {
  const supabase = createAdminClient()

  try {
    // Add credit to wallet
    const { error: walletError } = await supabase.rpc("update_wallet_balance", {
      user_id: userId,
      amount: amount,
      transaction_type: "credit",
      description: `Voucher: ${description}`,
    })

    if (walletError) throw walletError

    return { success: true }
  } catch (error) {
    console.error("Error issuing voucher:", error)
    return { success: false, error: "Failed to issue voucher" }
  }
}

export async function issueRefund(userId: string, amount: number, description: string) {
  const supabase = createAdminClient()

  try {
    // Add refund to wallet
    const { error: walletError } = await supabase.rpc("update_wallet_balance", {
      user_id: userId,
      amount: amount,
      transaction_type: "refund",
      description: `Refund: ${description}`,
    })

    if (walletError) throw walletError

    return { success: true }
  } catch (error) {
    console.error("Error issuing refund:", error)
    return { success: false, error: "Failed to issue refund" }
  }
}
