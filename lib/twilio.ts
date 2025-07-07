import twilio, { twiml } from "twilio"

// Configurazione Twilio - dalle variabili d'ambiente
export const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID!
export const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN!
export const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER!

// Client Twilio
export const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

// Tipi per le chiamate
export interface CallSession {
  id: string
  clientId: string
  operatorId: string
  clientPhone: string // Numero reale del cliente
  operatorPhone: string // Numero reale dell'operatore
  ratePerMinute: number
  status: "initiated" | "ringing" | "in-progress" | "completed" | "failed" | "no-answer"
  startTime?: Date
  endTime?: Date
  duration?: number
  cost?: number
  operatorEarning?: number
  platformFee?: number
  twilioCallSid?: string
  createdAt: Date
}

// Utility per generare TwiML (istruzioni per Twilio)
export function generateTwiML(action: string, params?: any): string {
  // MODIFICA: Importazione più specifica per TwiML per risolvere l'errore
  const { VoiceResponse } = twiml
  const response = new VoiceResponse()

  switch (action) {
    case "connect_call":
      response.say({ language: "it-IT" }, "Connessione in corso con il tuo consulente...")
      response.dial(
        {
          callerId: TWILIO_PHONE_NUMBER, // Maschera il numero
          record: "record-from-answer",
          recordingStatusCallback: "/api/calls/recording-status",
        },
        params.number,
      )
      break

    case "operator_busy":
      response.say({ language: "it-IT" }, "Il consulente non è al momento disponibile. Riprova più tardi.")
      response.hangup()
      break

    case "insufficient_credit":
      response.say({ language: "it-IT" }, "Credito insufficiente per effettuare la chiamata.")
      response.hangup()
      break

    default:
      response.say({ language: "it-IT" }, "Errore nel sistema. Riprova più tardi.")
      response.hangup()
  }

  return response.toString()
}

// Utility per validare i webhook di Twilio (sicurezza)
export function validateTwilioSignature(signature: string, url: string, params: any): boolean {
  return twilio.validateRequest(TWILIO_AUTH_TOKEN, signature, url, params)
}
