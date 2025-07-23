"use server"

import { twilioClient, type CallSession } from "@/lib/twilio"
import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

const mockCallSessions = new Map<string, CallSession>()
const mockUserWallets = new Map<string, number>([
  ["user123", 50.0],
  ["user456", 25.5],
])

export interface InitiateCallResult {
  success: boolean
  sessionId?: string
  error?: string
  estimatedCost?: number
}

export async function initiateCallAction(operatorId: string): Promise<InitiateCallResult> {
  const supabase = createClient()
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
  const clientId = "user123" // Assuming a default client for simplicity

  try {
    const clientWallet = mockUserWallets.get(clientId) || 0
    const minimumCredit = ratePerMinute * 2

    if (clientWallet < minimumCredit) {
      return {
        success: false,
        error: `Credito insufficiente. Necessari almeno €${minimumCredit.toFixed(2)}.`,
      }
    }

    const sessionId = `call_${Date.now()}`
    const callSession: CallSession = {
      id: sessionId,
      clientId,
      operatorId,
      clientPhone: "+393331234567",
      operatorPhone,
      ratePerMinute,
      status: "initiated",
      createdAt: new Date(),
    }
    mockCallSessions.set(sessionId, callSession)

    const call = await twilioClient.calls.create({
      to: callSession.clientPhone,
      from: process.env.TWILIO_PHONE_NUMBER!,
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/calls/twiml?action=connect_call&session=${sessionId}`,
      statusCallback: `${process.env.NEXT_PUBLIC_BASE_URL}/api/calls/status`,
      statusCallbackEvent: ["initiated", "ringing", "answered", "completed"],
      statusCallbackMethod: "POST",
    })

    callSession.twilioCallSid = call.sid
    callSession.status = "ringing"
    mockCallSessions.set(sessionId, callSession)

    return {
      success: true,
      sessionId,
      estimatedCost: ratePerMinute * 5,
    }
  } catch (error) {
    console.error("Error initiating call:", error)
    return {
      success: false,
      error: "Errore nel sistema. Riprova più tardi.",
    }
  }
}

export async function endCallAction(callId: string): Promise<{ success: boolean }> {
  try {
    const session = mockCallSessions.get(callId)
    if (!session || !session.twilioCallSid) {
      return { success: false }
    }
    await twilioClient.calls(session.twilioCallSid).update({ status: "completed" })
    session.status = "completed"
    session.endTime = new Date()
    mockCallSessions.set(callId, session)
    return { success: true }
  } catch (error) {
    console.error("Error ending call:", error)
    return { success: false }
  }
}

export async function getUserWalletAction(userId: string): Promise<number> {
  const supabase = createClient()
  const { data: walletData, error: walletError } = await supabase
    .from("wallets")
    .select("balance")
    .eq("user_id", userId)
    .single()

  if (walletError) {
    console.error("Error fetching user wallet:", walletError)
    return 0
  }

  return walletData.balance || 0
}

async function getOperatorCommissionRate(operatorId: string): Promise<number> {
  const mockOperatorCommissions = new Map<string, number>([
    ["operator1", 40],
    ["operator2", 35],
  ])
  return mockOperatorCommissions.get(operatorId) || 30
}

export async function processCallBillingAction(
  callId: string,
  duration: number,
): Promise<{ success: boolean; finalCost?: number }> {
  try {
    const session = mockCallSessions.get(callId)
    if (!session) return { success: false }

    const durationMinutes = Math.ceil(duration / 60)
    const totalCost = durationMinutes * session.ratePerMinute
    const operatorCommissionRate = await getOperatorCommissionRate(session.operatorId)
    const operatorEarning = totalCost * (operatorCommissionRate / 100)
    const platformFee = totalCost - operatorEarning

    const clientWallet = mockUserWallets.get(session.clientId) || 0
    mockUserWallets.set(session.clientId, clientWallet - totalCost)

    const operatorWallet = mockUserWallets.get(session.operatorId) || 0
    mockUserWallets.set(session.operatorId, operatorWallet + operatorEarning)

    session.duration = duration
    session.cost = totalCost
    session.operatorEarning = operatorEarning
    session.platformFee = platformFee
    session.status = "completed"
    mockCallSessions.set(callId, session)

    revalidatePath("/dashboard/client/wallet")
    revalidatePath("/dashboard/operator/earnings")

    return {
      success: true,
      finalCost: totalCost,
    }
  } catch (error) {
    console.error("Error processing billing:", error)
    return { success: false }
  }
}

export async function getCallHistoryAction(userId: string, userType: "client" | "operator") {
  const sessions = Array.from(mockCallSessions.values())
  return sessions
    .filter((session) => (userType === "client" ? session.clientId === userId : session.operatorId === userId))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
}
