"use server"

import { createClient } from "@/lib/supabase/server"
import { Twilio } from "twilio"

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER
const twilioClient = new Twilio(accountSid, authToken)

export interface InitiateCallResult {
  success: boolean
  callSid?: string
  error?: string
}

export async function initiateCallAction(operatorId: string): Promise<InitiateCallResult> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const { data: operatorData, error: operatorError } = await supabase
    .from("operators")
    .select("phone_number, rate_per_minute")
    .eq("id", operatorId)
    .single()

  if (operatorError) {
    console.error("Error fetching operator data:", operatorError)
    return {
      success: false,
      error: "Errore nel sistema. Riprova più tardi.",
    }
  }

  const operatorPhone = operatorData.phone_number
  const ratePerMinute = operatorData.rate_per_minute
  const clientId = user.id

  try {
    const clientWallet = await getUserWalletAction()
    if (clientWallet.error) {
      return {
        success: false,
        error: clientWallet.error,
      }
    }

    const minimumCredit = ratePerMinute * 2

    if (clientWallet.balance < minimumCredit) {
      return {
        success: false,
        error: `Credito insufficiente. Necessari almeno €${minimumCredit.toFixed(2)}.`,
      }
    }

    const call = await twilioClient.calls.create({
      to: operatorPhone,
      from: twilioPhoneNumber!,
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/calls/twiml?action=connect_call&user=${clientId}`,
      statusCallback: `${process.env.NEXT_PUBLIC_BASE_URL}/api/calls/status`,
      statusCallbackEvent: ["initiated", "ringing", "answered", "completed"],
      statusCallbackMethod: "POST",
    })

    return {
      success: true,
      callSid: call.sid,
    }
  } catch (error) {
    console.error("Error initiating call:", error)
    return {
      success: false,
      error: "Errore nel sistema. Riprova più tardi.",
    }
  }
}

export async function endCallAction(callSid: string): Promise<{ success: boolean }> {
  try {
    await twilioClient.calls(callSid).update({ status: "completed" })
    return { success: true }
  } catch (error) {
    console.error("Error ending call:", error)
    return { success: false }
  }
}

export async function getUserWalletAction(): Promise<{ balance: number } | { error: string }> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const { data, error } = await supabase.from("wallets").select("balance").eq("user_id", user.id).single()
  if (error) return { error: "Wallet not found" }
  return { balance: data.balance }
}

export async function processCallBillingAction(
  callSid: string,
  duration: number,
): Promise<{ success: boolean; finalCost?: number }> {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { success: false }

    const { data: callData, error: callError } = await supabase
      .from("consultations")
      .select("operator_id, rate_per_minute")
      .eq("call_sid", callSid)
      .single()

    if (callError) {
      console.error("Error fetching call data:", callError)
      return { success: false }
    }

    const operatorId = callData.operator_id
    const ratePerMinute = callData.rate_per_minute

    const durationMinutes = Math.ceil(duration / 60)
    const totalCost = durationMinutes * ratePerMinute
    const operatorCommissionRate = await getOperatorCommissionRate(operatorId)
    const operatorEarning = totalCost * (operatorCommissionRate / 100)
    const platformFee = totalCost - operatorEarning

    const clientWallet = await getUserWalletAction()
    if (clientWallet.error) {
      return {
        success: false,
        error: clientWallet.error,
      }
    }

    const operatorWallet = await getUserWalletAction()
    if (operatorWallet.error) {
      return {
        success: false,
        error: operatorWallet.error,
      }
    }

    await supabase
      .from("wallets")
      .update({ balance: clientWallet.balance - totalCost })
      .eq("user_id", user.id)
    await supabase
      .from("wallets")
      .update({ balance: operatorWallet.balance + operatorEarning })
      .eq("user_id", operatorId)

    await supabase
      .from("consultations")
      .update({
        duration,
        cost: totalCost,
        operator_earning: operatorEarning,
        platform_fee: platformFee,
        status: "completed",
      })
      .eq("call_sid", callSid)

    return {
      success: true,
      finalCost: totalCost,
    }
  } catch (error) {
    console.error("Error processing billing:", error)
    return { success: false }
  }
}

export async function getCallHistoryAction(): Promise<{ history: any[] } | { error: string }> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const { data, error } = await supabase.from("consultations").select("*").eq("user_id", user.id).eq("type", "call")
  if (error) return { error: "Could not fetch call history" }
  return { history: data }
}

async function getOperatorCommissionRate(operatorId: string): Promise<number> {
  const mockOperatorCommissions = new Map<string, number>([
    ["operator1", 40],
    ["operator2", 35],
  ])
  return mockOperatorCommissions.get(operatorId) || 30
}
