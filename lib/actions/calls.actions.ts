"use server"

import { twilioClient, type CallSession, type CallBilling } from "@/lib/twilio"
import { revalidatePath } from "next/cache"

// Mock database functions - sostituire con vero database
const mockCallSessions = new Map<string, CallSession>()
const mockCallBilling = new Map<string, CallBilling>()
const mockUserWallets = new Map<string, number>()

// Inizializza wallet mock
mockUserWallets.set("user123", 50.0) // €50 di credito
mockUserWallets.set("user456", 25.5) // €25.50 di credito

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

    // 1. Verifica credito utente
    const clientWallet = mockUserWallets.get(clientId) || 0
    const minimumCredit = ratePerMinute * 2 // Minimo 2 minuti di credito

    if (clientWallet < minimumCredit) {
      return {
        success: false,
        error: `Credito insufficiente. Necessari almeno €${minimumCredit.toFixed(2)} per questa chiamata.`,
      }
    }

    // 2. Verifica disponibilità operatore (mock)
    const isOperatorAvailable = Math.random() > 0.2 // 80% disponibilità
    if (!isOperatorAvailable) {
      return {
        success: false,
        error: "L'operatore non è al momento disponibile. Riprova più tardi.",
      }
    }

    // 3. Crea sessione chiamata
    const sessionId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const callSession: CallSession = {
      id: sessionId,
      clientId,
      operatorId,
      clientPhone: "+393331234567", // Mock - da prendere dal profilo utente
      operatorPhone,
      ratePerMinute,
      status: "initiated",
      createdAt: new Date(),
    }

    mockCallSessions.set(sessionId, callSession)

    // 4. Inizia chiamata Twilio
    const call = await twilioClient.calls.create({
      to: callSession.clientPhone,
      from: process.env.TWILIO_PHONE_NUMBER!,
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/calls/twiml?action=connect_call&session=${sessionId}`,
      statusCallback: `${process.env.NEXT_PUBLIC_BASE_URL}/api/calls/status`,
      statusCallbackEvent: ["initiated", "ringing", "answered", "completed"],
      statusCallbackMethod: "POST",
      record: true,
      recordingStatusCallback: `${process.env.NEXT_PUBLIC_BASE_URL}/api/calls/recording-status`,
    })

    // 5. Aggiorna sessione con Twilio SID
    callSession.twilioCallSid = call.sid
    callSession.status = "ringing"
    mockCallSessions.set(sessionId, callSession)

    console.log("✅ Call initiated successfully:", call.sid)

    return {
      success: true,
      sessionId,
      estimatedCost: ratePerMinute * 5, // Stima 5 minuti
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
    if (!session || !session.twilioCallSid) {
      return { success: false }
    }

    // Termina chiamata Twilio
    await twilioClient.calls(session.twilioCallSid).update({ status: "completed" })

    // Aggiorna sessione
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

// Funzione per recuperare la commissione dell'operatore dal sistema esistente
async function getOperatorCommissionRate(operatorId: string): Promise<number> {
  // Mock - sostituire con query al database reale
  const mockOperatorCommissions = new Map<string, number>([
    ["operator1", 40], // Operatore prende 40%, piattaforma 60%
    ["operator2", 35], // Operatore prende 35%, piattaforma 65%
    ["operator3", 45], // Operatore prende 45%, piattaforma 55%
  ])

  return mockOperatorCommissions.get(operatorId) || 30 // Default 30% se non trovato
}

export async function processCallBillingAction(
  sessionId: string,
  durationSeconds: number,
): Promise<{ success: boolean; finalCost?: number; operatorEarning?: number; platformFee?: number }> {
  try {
    const session = mockCallSessions.get(sessionId)
    if (!session) return { success: false }

    // Calcola costo totale
    const durationMinutes = Math.ceil(durationSeconds / 60) // Arrotonda per eccesso
    const totalCost = durationMinutes * session.ratePerMinute

    // RECUPERA COMMISSIONE OPERATORE DAL DATABASE (mock per ora)
    const operatorCommissionRate = await getOperatorCommissionRate(session.operatorId)

    // Calcola guadagni basati sulla commissione esistente
    const operatorEarning = totalCost * (operatorCommissionRate / 100)
    const platformFee = totalCost * ((100 - operatorCommissionRate) / 100)

    // Aggiorna wallet cliente
    const clientWallet = mockUserWallets.get(session.clientId) || 0
    const newClientWallet = Math.max(0, clientWallet - totalCost)
    mockUserWallets.set(session.clientId, newClientWallet)

    // Accredita operatore con la sua commissione
    const operatorWallet = mockUserWallets.get(session.operatorId) || 0
    mockUserWallets.set(session.operatorId, operatorWallet + operatorEarning)

    // Aggiorna sessione
    session.duration = durationSeconds
    session.cost = totalCost
    session.operatorEarning = operatorEarning
    session.platformFee = platformFee
    session.status = "completed"
    mockCallSessions.set(sessionId, session)

    console.log("💰 Call billing processed with existing commission system:", {
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

// Funzione per ottenere storico chiamate
export async function getCallHistoryAction(userId: string, userType: "client" | "operator") {
  const sessions = Array.from(mockCallSessions.values())

  return sessions
    .filter((session) => (userType === "client" ? session.clientId === userId : session.operatorId === userId))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
}
