"use server"
import createServerClient from "@/lib/supabase/server"

export async function initiateCallAction(operatorId: string) {
  // Logic to initiate a call
  return { success: true, callSid: "call-sid" }
}

export async function endCallAction(callSid: string) {
  // Logic to end a call
  return { success: true }
}

export async function getUserWalletAction() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const { data, error } = await supabase.from("wallets").select("balance").eq("user_id", user.id).single()
  if (error) return { error: error.message }
  return { balance: data.balance }
}

export async function processCallBillingAction(callSid: string, duration: number) {
  // Logic to process billing for the call
  return { success: true }
}

export async function getCallHistoryAction() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const { data, error } = await supabase.from("consultations").select("*").eq("client_id", user.id).eq("type", "call")
  if (error) return []
  return data
}
