"use server"

import { twilioClient, type CallSession } from "@/lib/twilio"
import { revalidatePath } from "next/cache"

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

export async function initiateCallAction(
  clientId: string,
  operatorId: string,
  operatorPhone: string,
  ratePerMinute: number,
): Promise<InitiateCallResult> {
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

export async function endCallAction(sessionId: string): Promise<{ success: boolean }> {
  try {
    const session = mockCallSessions.get(sessionId)
    if (!session || !session.twilioCallSid) {
      return { success: false }
    }
    await twilioClient.calls(session.twilioCallSid).update({ status: "completed" })
    session.status = "completed"
    session.endTime = new Date()
    mockCallSessions.set(sessionId, session)
    return { success: true }
  } catch (error) {
    console.error("Error ending call:", error)
    return { success: false }
  }
}

export async function getUserWalletAction(userId: string): Promise<number> {
  return mockUserWallets.get(userId) || 0
}

async function getOperatorCommissionRate(operatorId: string): Promise<number> {
  const mockOperatorCommissions = new Map<string, number>([
    ["operator1", 40],
    ["operator2", 35],
  ])
  return mockOperatorCommissions.get(operatorId) || 30
}

export async function processCallBillingAction(
  sessionId: string,
  durationSeconds: number,
): Promise<{ success: boolean; finalCost?: number }> {
  try {
    const session = mockCallSessions.get(sessionId)
    if (!session) return { success: false }

    const durationMinutes = Math.ceil(durationSeconds / 60)
    const totalCost = durationMinutes * session.ratePerMinute
    const operatorCommissionRate = await getOperatorCommissionRate(session.operatorId)
    const operatorEarning = totalCost * (operatorCommissionRate / 100)
    const platformFee = totalCost - operatorEarning

    const clientWallet = mockUserWallets.get(session.clientId) || 0
    mockUserWallets.set(session.clientId, clientWallet - totalCost)

    const operatorWallet = mockUserWallets.get(session.operatorId) || 0
    mockUserWallets.set(session.operatorId, operatorWallet + operatorEarning)

    session.duration = durationSeconds
    session.cost = totalCost
    session.operatorEarning = operatorEarning
    session.platformFee = platformFee
    session.status = "completed"
    mockCallSessions.set(sessionId, session)

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
