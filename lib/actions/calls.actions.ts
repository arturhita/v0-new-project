"use server"

import { createTwilioCall, endTwilioCall, type CallSession } from "@/lib/twilio"
import { revalidatePath } from "next/cache"

// --- MOCK DATABASE ---
const mockData = {
  users: {
    user123: {
      id: "user123",
      name: "Mario Rossi",
      // ! IMPORTANTE PER IL TEST: Assicurati che questo numero sia VERIFICATO
      // ! nella tua console Twilio.
      phone: "+393331122333",
      wallet: 50.0,
    },
  },
  operators: {
    op123: {
      id: "op123",
      name: "Dott.ssa Elara",
      // ! Assicurati che anche questo numero (dalle env) sia VERIFICATO su Twilio.
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
    const baseURL = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"
    const client = mockData.users[clientId as keyof typeof mockData.users]
    if (!client) throw new Error("Cliente non trovato")

    console.log(`[Call Action] Tentativo di chiamata per il cliente: ${client.name} (${client.phone})`)
    console.log(`[Call Action] Numero operatore da connettere: ${operatorPhone}`)

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

    const twimlUrl = `${baseURL}/api/calls/twiml?action=connect_call&session=${sessionId}&number=${encodeURIComponent(operatorPhone)}`
    const statusCallbackUrl = `${baseURL}/api/calls/status`

    console.log(`[Call Action] Invio richiesta a Twilio per chiamare: ${client.phone}`)
    console.log(`[Call Action] TwiML URL per Twilio: ${twimlUrl}`)

    const call = await createTwilioCall(client.phone, twimlUrl, statusCallbackUrl)

    callSession.twilioCallSid = call.sid
    callSession.status = "ringing"
    mockData.callSessions.set(sessionId, callSession)

    console.log(`✅ Chiamata avviata con successo tramite API: ${call.sid} per la sessione ${sessionId}`)
    return { success: true, sessionId }
  } catch (error: any) {
    console.error("❌ Errore durante l'avvio della chiamata:", error)
    return { success: false, error: error.message || "Errore del sistema di chiamata." }
  }
}

export async function endCallAction(sessionId: string): Promise<{ success: boolean }> {
  try {
    const session = mockData.callSessions.get(sessionId)
    if (!session || !session.twilioCallSid) {
      console.error(`Impossibile terminare la chiamata, sessione ${sessionId} non trovata o senza SID Twilio.`)
      return { success: false }
    }

    if (session.status === "completed") {
      return { success: true }
    }

    await endTwilioCall(session.twilioCallSid)

    console.log(`✅ Chiamata terminata manualmente: ${sessionId}`)
    return { success: true }
  } catch (error) {
    console.error(`❌ Errore durante la terminazione della chiamata ${sessionId}:`, error)
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
      console.error(`❌ Billing: Sessione non trovata per il SID Twilio ${twilioCallSid}`)
      return { success: false }
    }
    const [sessionId, session] = sessionEntry

    if (session.status === "completed") {
      console.log(`💰 Billing già processato per la sessione ${sessionId}`)
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

    console.log("💰 Billing processato:", {
      sessionId,
      duration: `${durationSeconds}s (${durationMinutes}min fatturati)`,
      totalCost,
      operatorEarning,
      platformFee,
    })

    revalidatePath(`/dashboard/client/calls`)
    revalidatePath(`/dashboard/operator/calls`)

    return { success: true }
  } catch (error) {
    console.error("❌ Errore durante il processamento del billing:", error)
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
