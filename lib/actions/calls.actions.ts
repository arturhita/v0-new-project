"use server"

import { twilioClient, type CallSession } from "@/lib/twilio"
import { revalidatePath } from "next/cache"

// --- SISTEMA DI MOCKUP ---
// In un'applicazione reale, questi dati proverrebbero da Supabase.
const mockDatabase: {
  users: { [id: string]: { id: string; name: string; phone: string; wallet: number } }
  operators: {
    [id: string]: {
      id: string
      name: string
      phone: string
      ratePerMinute: number
      commissionRate: number
      earnings: number
    }
  }
  callSessions: { [id: string]: CallSession }
} = {
  users: {
    // ! IMPORTANTE PER IL TEST:
    // ! Sostituisci il numero di telefono qui sotto con il TUO numero di telefono reale,
    // ! in formato internazionale (es. +393331234567).
    // ! Questo è il telefono che riceverà la chiamata quando clicchi "Chiama Ora".
    user_123: { id: "user_123", name: "Mario Rossi", phone: "+393330000001", wallet: 50.0 },
  },
  operators: {
    op_456: {
      id: "op_456",
      name: "Dott.ssa Verdi",
      phone: process.env.NEXT_PUBLIC_OPERATOR_PHONE_NUMBER!,
      ratePerMinute: 1.5,
      commissionRate: 0.7,
      earnings: 0,
    },
  },
  callSessions: {},
}
// --- FINE SISTEMA DI MOCKUP ---

// Funzione per avviare una chiamata
export async function startCall(clientId: string, operatorId: string) {
  try {
    const client = mockDatabase.users[clientId]
    const operator = mockDatabase.operators[operatorId]

    if (!client || !operator) {
      throw new Error("Cliente o operatore non trovato.")
    }

    // 1. Controllo del credito: l'utente deve avere credito per almeno 1 minuto
    if (client.wallet < operator.ratePerMinute) {
      return { success: false, error: "Credito insufficiente. Ricarica il tuo portafoglio." }
    }

    // 2. Creazione della sessione di chiamata nel nostro DB (mock)
    const sessionId = `call_${Date.now()}`
    const newSession: CallSession = {
      id: sessionId,
      clientId,
      operatorId,
      clientPhone: client.phone,
      operatorPhone: operator.phone,
      ratePerMinute: operator.ratePerMinute,
      status: "initiated",
      createdAt: new Date(),
    }
    mockDatabase.callSessions[sessionId] = newSession

    // 3. Avvio della chiamata tramite Twilio
    // Twilio chiama prima il cliente. Quando il cliente risponde,
    // Twilio esegue le istruzioni TwiML fornite dall'URL.
    const call = await twilioClient.calls.create({
      twiml: `<Response><Say language="it-IT">Stai per essere connesso al consulente. Attendi in linea.</Say><Dial><Number>${operator.phone}</Number></Dial></Response>`,
      to: client.phone,
      from: process.env.TWILIO_PHONE_NUMBER!,
      // L'URL che Twilio chiamerà per ottenere aggiornamenti di stato
      statusCallback: `${process.env.NEXT_PUBLIC_BASE_URL}/api/calls/status?sessionId=${sessionId}`,
      statusCallbackEvent: ["initiated", "ringing", "answered", "completed"],
    })

    // 4. Aggiorniamo la nostra sessione con il SID di Twilio
    mockDatabase.callSessions[sessionId].twilioCallSid = call.sid
    mockDatabase.callSessions[sessionId].status = "ringing"

    console.log(`Chiamata avviata con SID: ${call.sid} per la sessione ${sessionId}`)

    revalidatePath("/dashboard/client/calls")
    revalidatePath("/dashboard/operator/calls")

    return { success: true, sessionId: sessionId, callSid: call.sid }
  } catch (error: any) {
    console.error("Errore nell'avvio della chiamata:", error)
    return { success: false, error: error.message }
  }
}

// Funzione per terminare una chiamata
export async function endCall(sessionId: string) {
  try {
    const session = mockDatabase.callSessions[sessionId]
    if (!session || !session.twilioCallSid) {
      throw new Error("Sessione di chiamata non valida.")
    }

    // 1. Termina la chiamata su Twilio
    await twilioClient.calls(session.twilioCallSid).update({ status: "completed" })

    // 2. Calcola costi e commissioni (la logica di calcolo è nel webhook di stato 'completed')
    // Qui forziamo un ricalcolo per sicurezza, ma il webhook è la fonte primaria.
    if (session.startTime) {
      session.endTime = new Date()
      const durationSeconds = (session.endTime.getTime() - session.startTime.getTime()) / 1000
      const durationMinutes = Math.ceil(durationSeconds / 60)
      session.duration = Math.round(durationSeconds)
      session.cost = durationMinutes * session.ratePerMinute

      const operator = mockDatabase.operators[session.operatorId]
      session.operatorEarning = session.cost * operator.commissionRate
      session.platformFee = session.cost - session.operatorEarning

      // Aggiorna wallet e guadagni
      mockDatabase.users[session.clientId].wallet -= session.cost
      operator.earnings += session.operatorEarning
    }

    session.status = "completed"
    console.log(`Chiamata ${session.twilioCallSid} terminata manualmente.`)

    revalidatePath("/dashboard/client/calls")
    revalidatePath("/dashboard/operator/calls")

    return { success: true }
  } catch (error: any) {
    console.error("Errore nella terminazione della chiamata:", error)
    return { success: false, error: error.message }
  }
}

// Funzione per ottenere lo storico delle chiamate
export async function getCallHistory(userId: string, userType: "client" | "operator") {
  if (userType === "client") {
    return Object.values(mockDatabase.callSessions).filter((s) => s.clientId === userId)
  }
  return Object.values(mockDatabase.callSessions).filter((s) => s.operatorId === userId)
}

// Funzione per ottenere i dati dell'utente/operatore (per il componente)
export async function getCallerInfo(userId: string, userType: "client" | "operator") {
  if (userType === "client") {
    return mockDatabase.users[userId]
  }
  return mockDatabase.operators[userId]
}
