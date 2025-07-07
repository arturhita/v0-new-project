"use server"

import { twilioClient, type CallSession } from "@/lib/twilio"
import { revalidatePath } from "next/cache"

// --- MOCK DATABASE ---
// In un'applicazione reale, questi dati proverrebbero da Supabase.
const mockData = {
  users: {
    user123: {
      id: "user123",
      name: "Mario Rossi",
      // ! IMPORTANTE PER IL TEST:
      // ! Sostituisci questo numero con il TUO numero di telefono reale (formato E.164)
      // ! per ricevere la chiamata come "cliente".
      phone: "+393331122333",
      wallet: 50.0,
    },
  },
  operators: {
    op123: {
      id: "op123",
      name: "Dott.ssa Elara",
      // Questo numero viene dalle variabili d'ambiente
      phone: process.env.NEXT_PUBLIC_OPERATOR_PHONE_NUMBER!,
      ratePerMinute: 1.5,
      commissionRate: 0.7, // 70%
      earnings: 150.0,
    },
  },
  callSessions: new Map<string, CallSession>(),
}
// --- END MOCK DATABASE ---

export async function initiateCallAction(
  clientId: string,
  operatorId: string,
  operatorPhone: string,
  ratePerMinute: number,
): Promise<{ success: boolean; sessionId?: string; error?: string }> {
  try {
    const client = mockData.users[clientId as keyof typeof mockData.users]
    if (!client) throw new Error("Cliente non trovato")

    if (client.wallet < ratePerMinute) {
      return { success: false, error: "Credito insufficiente. Ricarica per continuare." }
    }

    const sessionId = `call_${Date.now()}`
    const callSession: CallSession = {
      id: sessionId,
      clientId,
      operatorId,
      clientPhone: client.phone,
      operatorPhone: operatorPhone,
      ratePerMinute,
      status: "initiated",
      createdAt: new Date(),
    }
    mockData.callSessions.set(sessionId, callSession)

    const call = await twilioClient.calls.create({
      to: client.phone,
      from: process.env.TWILIO_PHONE_NUMBER!,
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/calls/twiml?action=connect_call&session=${sessionId}&number=${encodeURIComponent(operatorPhone)}`,
      statusCallback: `${process.env.NEXT_PUBLIC_BASE_URL}/api/calls/status`,
      statusCallbackEvent: ["initiated", "ringing", "answered", "completed"],
      statusCallbackMethod: "POST",
    })

    callSession.twilioCallSid = call.sid
    callSession.status = "ringing"
    mockData.callSessions.set(sessionId, callSession)

    console.log(`✅ Call initiated: ${call.sid} for session ${sessionId}`)
    return { success: true, sessionId }
  } catch (error: any) {
    console.error("❌ Error initiating call:", error)
    return { success: false, error: error.message || "Errore del sistema di chiamata." }
  }
}

export async function endCallAction(sessionId: string): Promise<{ success: boolean }> {
  try {
    const session = mockData.callSessions.get(sessionId)
    if (!session || !session.twilioCallSid) {
      console.error(`Cannot end call, session ${sessionId} not found or has no Twilio SID.`)
      return { success: false }
    }

    if (session.status === "completed") {
      return { success: true }
    }

    await twilioClient.calls(session.twilioCallSid).update({ status: "completed" })
    console.log(`✅ Call ended manually: ${sessionId}`)
    return { success: true }
  } catch (error) {
    console.error(`❌ Error ending call ${sessionId}:`, error)
    return { success: false }
  }
}

export async function processCallBillingAction(
  twilioCallSid: string,
  durationSeconds: number,
): Promise<{ success: boolean }> {
  try {
    const sessionEntry = Array.from(mockData.callSessions.entries()).find(([_, s]) => s.twilioCallSid === twilioCallSid)
    if (!sessionEntry) {
      console.error(`❌ Billing: Session not found for Twilio SID ${twilioCallSid}`)
      return { success: false }
    }
    const [sessionId, session] = sessionEntry

    if (session.status === "completed") {
      console.log(`💰 Billing already processed for session ${sessionId}`)
      return { success: true }
    }

    const durationMinutes = Math.ceil(durationSeconds / 60)
    const totalCost = durationMinutes * session.ratePerMinute

    const operator = mockData.operators[session.operatorId as keyof typeof mockData.operators]
    const operatorEarning = totalCost * operator.commissionRate
    const platformFee = totalCost - operatorEarning

    const client = mockData.users[session.clientId as keyof typeof mockData.users]
    client.wallet -= totalCost
    operator.earnings += operatorEarning

    session.duration = durationSeconds
    session.cost = totalCost
    session.operatorEarning = operatorEarning
    session.platformFee = platformFee
    session.status = "completed"
    session.endTime = new Date()
    mockData.callSessions.set(sessionId, session)

    console.log("💰 Billing processed:", {
      sessionId,
      duration: `${durationSeconds}s (${durationMinutes}min billed)`,
      totalCost,
      operatorEarning,
      platformFee,
    })

    revalidatePath(`/dashboard/client/calls`)
    revalidatePath(`/dashboard/operator/calls`)

    return { success: true }
  } catch (error) {
    console.error("❌ Error processing billing:", error)
    return { success: false }
  }
}

export async function getCallHistoryAction(userId: string, userType: "client" | "operator") {
  const sessions = Array.from(mockData.callSessions.values())
  const filtered = sessions.filter((s) => (userType === "client" ? s.clientId === userId : s.operatorId === userId))
  return filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
}

export async function getUserWalletAction(userId: string): Promise<number> {
  const user = mockData.users[userId as keyof typeof mockData.users]
  return user ? user.wallet : 0
}
