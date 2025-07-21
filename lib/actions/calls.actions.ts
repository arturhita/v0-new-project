"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function initiateCallAction(operatorId: string) {
  const supabase = createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("User not authenticated")

    // Create call session
    const { data: callSession, error } = await supabase
      .from("call_sessions")
      .insert({
        client_id: user.id,
        operator_id: operatorId,
        status: "initiated",
      })
      .select()
      .single()

    if (error) throw error

    return { success: true, callSession }
  } catch (error) {
    console.error("Error initiating call:", error)
    return { success: false, error: "Failed to initiate call" }
  }
}

export async function endCallAction(callSessionId: string, duration: number) {
  const supabase = createAdminClient()

  try {
    const { data, error } = await supabase
      .from("call_sessions")
      .update({
        status: "completed",
        end_time: new Date().toISOString(),
        duration: duration,
      })
      .eq("id", callSessionId)
      .select()
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error("Error ending call:", error)
    return { success: false, error: "Failed to end call" }
  }
}

export async function getUserWalletAction(userId: string) {
  const supabase = createClient()

  const { data: profile, error } = await supabase.from("profiles").select("wallet_balance").eq("id", userId).single()

  if (error) {
    console.error("Error fetching wallet balance:", error)
    return { balance: 0 }
  }

  return { balance: profile?.wallet_balance || 0 }
}

export async function processCallBillingAction(callSessionId: string, cost: number) {
  const supabase = createAdminClient()

  try {
    // Update call session with cost
    const { error: callError } = await supabase.from("call_sessions").update({ cost }).eq("id", callSessionId)

    if (callError) throw callError

    // Get call session details
    const { data: callSession, error: sessionError } = await supabase
      .from("call_sessions")
      .select("client_id, operator_id")
      .eq("id", callSessionId)
      .single()

    if (sessionError) throw sessionError

    // Deduct from client wallet
    const { error: debitError } = await supabase.rpc("update_wallet_balance", {
      user_id: callSession.client_id,
      amount: -cost,
      transaction_type: "debit",
      description: "Call charge",
    })

    if (debitError) throw debitError

    return { success: true }
  } catch (error) {
    console.error("Error processing call billing:", error)
    return { success: false, error: "Failed to process billing" }
  }
}

export async function getCallHistoryAction(userId: string, userRole: "client" | "operator") {
  const supabase = createClient()

  const column = userRole === "client" ? "client_id" : "operator_id"

  const { data, error } = await supabase
    .from("call_sessions")
    .select(`
      *,
      client:profiles!call_sessions_client_id_fkey(full_name, avatar_url),
      operator:profiles!call_sessions_operator_id_fkey(stage_name, avatar_url)
    `)
    .eq(column, userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching call history:", error)
    return []
  }

  return data || []
}
