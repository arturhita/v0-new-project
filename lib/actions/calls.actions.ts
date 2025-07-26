"use server"

import { revalidatePath } from "next/cache"

export interface CallSession {
  id: string
  clientId: string
  operatorId: string
  clientPhone: string
  operatorPhone: string
  ratePerMinute: number
  status: "initiated" | "ringing" | "answered" | "completed" | "failed"
  createdAt: Date
  endTime?: Date
  duration?: number
  cost?: number
  operatorEarning?: number
  platformFee?: number
  twilioCallSid?: string
}

export interface CallBilling {
  sessionId: string
  totalCost: number
  operatorEarning: number
  platformFee: number
  durationMinutes: number
}

// Mock database
const mockCallSessions = new Map<string, CallSession>()
const mockCallBilling = new Map<string, CallBilling>()
const mockUserWallets = new Map<string, number>()

// Initialize mock wallets
mockUserWallets.set("user123", 50.0)
mockUserWallets.set("user456", 25.5)

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
    console.log("🔥 Initiating call:", { clientId, operatorId, ratePerMinute })

    const clientWallet = mockUserWallets.get(clientId) || 0
    const minimumCredit = ratePerMinute * 2

    if (clientWallet < minimumCredit) {
      return {
        success: false,
        error: `Credito insufficiente. Necessari almeno €${minimumCredit.toFixed(2)} per questa chiamata.`,
      }
    }

    const isOperatorAvailable = Math.random() > 0.2
    if (!isOperatorAvailable) {
      return {
        success: false,
        error: "L'operatore non è al momento disponibile. Riprova più tardi.",
      }
    }

    const sessionId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
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

    console.log("✅ Call initiated successfully:", sessionId)

    return {
      success: true,
      sessionId,
      estimatedCost: ratePerMinute * 5,
    }
  } catch (error) {
    console.error("❌ Error initiating call:", error)
    return {
      success: false,
      error: "Errore nel sistema. Riprova più tardi.",
    }
  }
}

export async function endCallAction(sessionId: string): Promise<{ success: boolean }> {
  try {
    const session = mockCallSessions.get(sessionId)
    if (!session) {
      return { success: false }
    }

    session.status = "completed"
    session.endTime = new Date()
    mockCallSessions.set(sessionId, session)

    console.log("✅ Call ended successfully:", sessionId)
    return { success: true }
  } catch (error) {
    console.error("❌ Error ending call:", error)
    return { success: false }
  }
}

export async function getCallSessionAction(sessionId: string): Promise<CallSession | null> {
  return mockCallSessions.get(sessionId) || null
}

export async function getUserWalletAction(userId: string): Promise<number> {
  return mockUserWallets.get(userId) || 0
}

async function getOperatorCommissionRate(operatorId: string): Promise<number> {
  const mockOperatorCommissions = new Map<string, number>([
    ["operator1", 40],
    ["operator2", 35],
    ["operator3", 45],
  ])

  return mockOperatorCommissions.get(operatorId) || 30
}

export async function processCallBillingAction(
  sessionId: string,
  durationSeconds: number,
): Promise<{ success: boolean; finalCost?: number; operatorEarning?: number; platformFee?: number }> {
  try {
    const session = mockCallSessions.get(sessionId)
    if (!session) return { success: false }

    const durationMinutes = Math.ceil(durationSeconds / 60)
    const totalCost = durationMinutes * session.ratePerMinute

    const operatorCommissionRate = await getOperatorCommissionRate(session.operatorId)

    const operatorEarning = totalCost * (operatorCommissionRate / 100)
    const platformFee = totalCost * ((100 - operatorCommissionRate) / 100)

    const clientWallet = mockUserWallets.get(session.clientId) || 0
    const newClientWallet = Math.max(0, clientWallet - totalCost)
    mockUserWallets.set(session.clientId, newClientWallet)

    const operatorWallet = mockUserWallets.get(session.operatorId) || 0
    mockUserWallets.set(session.operatorId, operatorWallet + operatorEarning)

    session.duration = durationSeconds
    session.cost = totalCost
    session.operatorEarning = operatorEarning
    session.platformFee = platformFee
    session.status = "completed"
    mockCallSessions.set(sessionId, session)

    console.log("💰 Call billing processed:", {
      sessionId,
      duration: durationMinutes,
      totalCost,
      operatorCommissionRate: `${operatorCommissionRate}%`,
      operatorEarning,
      platformFee,
    })

    revalidatePath("/dashboard/client/wallet")
    revalidatePath("/dashboard/operator/earnings")

    return {
      success: true,
      finalCost: totalCost,
      operatorEarning,
      platformFee,
    }
  } catch (error) {
    console.error("❌ Error processing billing:", error)
    return { success: false }
  }
}

export async function getCallHistoryAction(userId: string, userType: "client" | "operator") {
  const sessions = Array.from(mockCallSessions.values())

  return sessions
    .filter((session) => (userType === "client" ? session.clientId === userId : session.operatorId === userId))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
}
