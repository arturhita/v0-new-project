"use server"

import { twilioClient, type CallSession } from "@/lib/twilio"
import { revalidatePath } from "next/cache"

// Mock database - Sostituire con query a Supabase
const mockCallSessions = new Map<string, CallSession>()
const mockUserWallets = new Map<string, number>()
mockUserWallets.set("user123", 50.0) // Cliente con 50€ di credito
mockUserWallets.set("op123", 150.0) // Wallet operatore

export interface InitiateCallResult {
  success: boolean
  sessionId?: string
  error?: string
}

export async function initiateCallAction(
  clientId: string,
  operatorId: string,
  operatorPhone: string,
  ratePerMinute: number,
): Promise<InitiateCallResult> {
  try {
    console.log("🔥 Avvio chiamata:", { clientId, operatorId, ratePerMinute })

    const clientWallet = mockUserWallets.get(clientId) || 0
    const minimumCredit = ratePerMinute * 1 // Richiede credito per almeno 1 minuto

    if (clientWallet < minimumCredit) {
      return { success: false, error: `Credito insufficiente. Necessari almeno €${minimumCredit.toFixed(2)}.` }
    }

    const sessionId = `call_${Date.now()}`
    const callSession: CallSession = {
      id: sessionId,
      clientId,
      operatorId,
      // IMPORTANTE PER TEST: Inserisci qui il tuo numero di telefono per ricevere la chiamata come "cliente"
      // In produzione, questo numero verrà recuperato dal profilo dell'utente loggato.
      clientPhone: "+393471234567", // <-- SOSTITUIRE CON IL TUO NUMERO REALE IN FORMATO E.164
      operatorPhone,
      ratePerMinute,
      status: "initiated",
      createdAt: new Date(),
    }
    mockCallSessions.set(sessionId, callSession)

    // Twilio chiama prima il cliente
    const call = await twilioClient.calls.create({
      to: callSession.clientPhone,
      from: process.env.TWILIO_PHONE_NUMBER!,
      // Twilio userà questo URL per sapere cosa fare dopo che il cliente risponde
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/calls/twiml?action=connect_call&session=${sessionId}&number=${operatorPhone}`,
      statusCallback: `${process.env.NEXT_PUBLIC_BASE_URL}/api/calls/status`,
      statusCallbackEvent: ["initiated", "ringing", "answered", "completed"],
      statusCallbackMethod: "POST",
    })

    callSession.twilioCallSid = call.sid
    callSession.status = "ringing"
    mockCallSessions.set(sessionId, callSession)

    console.log("✅ Chiamata avviata con successo:", call.sid)
    return { success: true, sessionId }
  } catch (error) {
    console.error("❌ Errore avvio chiamata:", error)
    return { success: false, error: "Errore del sistema di chiamata." }
  }
}

export async function endCallAction(sessionId: string): Promise<{ success: boolean }> {
  try {
    const session = mockCallSessions.get(sessionId)
    if (!session || !session.twilioCallSid) return { success: false }

    await twilioClient.calls(session.twilioCallSid).update({ status: "completed" })
    console.log("✅ Chiamata terminata manualmente:", sessionId)
    return { success: true }
  } catch (error) {
    console.error("❌ Errore terminazione chiamata:", error)
    return { success: false }
  }
}

async function getOperatorCommissionRate(operatorId: string): Promise<number> {
  // Mock: in produzione, questa funzione interroga il DB
  return 70 // Esempio: 70% per l'operatore
}

export async function processCallBillingAction(
  twilioCallSid: string,
  durationSeconds: number,
): Promise<{ success: boolean }> {
  try {
    // Trova la sessione corrispondente al CallSid di Twilio
    const sessionEntry = Array.from(mockCallSessions.entries()).find(([_, s]) => s.twilioCallSid === twilioCallSid)
    if (!sessionEntry) {
      console.error(`❌ Billing: Sessione non trovata per Twilio SID ${twilioCallSid}`)
      return { success: false }
    }
    const [sessionId, session] = sessionEntry

    if (session.status === "completed") {
      console.log(`💰 Billing già processato per la sessione ${sessionId}`)
      return { success: true }
    }

    const durationMinutes = Math.ceil(durationSeconds / 60)
    const totalCost = durationMinutes * session.ratePerMinute

    const commissionRate = await getOperatorCommissionRate(session.operatorId)
    const operatorEarning = totalCost * (commissionRate / 100)
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
    session.endTime = new Date()
    mockCallSessions.set(sessionId, session)

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
    console.error("❌ Errore elaborazione billing:", error)
    return { success: false }
  }
}

export async function getCallHistoryAction(userId: string, userType: "client" | "operator") {
  const sessions = Array.from(mockCallSessions.values())
  return sessions
    .filter((s) => (userType === "client" ? s.clientId === userId : s.operatorId === userId))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
}

export async function getUserWalletAction(userId: string): Promise<number> {
  return mockUserWallets.get(userId) || 0
}
