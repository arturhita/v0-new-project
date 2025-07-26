import twilio from "twilio"

// Configurazione Twilio
export const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID!
export const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN!
export const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER!
export const TWILIO_WEBHOOK_SECRET = process.env.TWILIO_WEBHOOK_SECRET!

// Client Twilio
export const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

// Configurazione TwiML App per chiamate
export const TWIML_APP_SID = process.env.TWIML_APP_SID!

// Tipi per le chiamate
export interface CallSession {
  id: string
  clientId: string
  operatorId: string
  clientPhone: string
  operatorPhone: string
  ratePerMinute: number
  status: "initiated" | "ringing" | "in-progress" | "completed" | "failed" | "no-answer"
  startTime?: Date
  endTime?: Date
  duration?: number
  cost?: number
  twilioCallSid?: string
  createdAt: Date
}

export interface CallBilling {
  sessionId: string
  clientId: string
  operatorId: string
  ratePerMinute: number
  startTime: Date
  lastBilledAt: Date
  totalCost: number
  clientWalletBefore: number
  clientWalletAfter: number
}

// Utility per generare TwiML
export function generateTwiML(action: string, params?: any): string {
  const VoiceResponse = twilio.twiml.VoiceResponse
  const response = new VoiceResponse()

  switch (action) {
    case "connect_call":
      response.say("Connessione in corso con il tuo consulente...")
      response.dial(
        {
          callerId: TWILIO_PHONE_NUMBER,
          record: "record-from-answer",
          recordingStatusCallback: "/api/calls/recording-status",
        },
        params.number,
      )
      break

    case "operator_busy":
      response.say("Il consulente non è al momento disponibile. Riprova più tardi.")
      response.hangup()
      break

    case "insufficient_credit":
      response.say("Credito insufficiente per effettuare la chiamata.")
      response.hangup()
      break

    case "welcome_operator":
      response.say(`Hai una chiamata da un cliente. Premi 1 per accettare, 2 per rifiutare.`)
      response.gather({
        numDigits: 1,
        action: "/api/calls/operator-response",
        method: "POST",
      })
      break

    default:
      response.say("Errore nel sistema. Riprova più tardi.")
      response.hangup()
  }

  return response.toString()
}

// Utility per validare webhook Twilio
export function validateTwilioSignature(signature: string, url: string, params: any): boolean {
  return twilio.validateRequest(TWILIO_AUTH_TOKEN, signature, url, params)
}
