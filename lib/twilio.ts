import twilio from "twilio"

// Inizializza il client di Twilio con le credenziali dalle variabili d'ambiente
export const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

// Esporta correttamente il costruttore per le risposte TwiML
export const VoiceResponse = twilio.twiml.VoiceResponse

// Definisce la struttura dati per una sessione di chiamata
export interface CallSession {
  id: string
  clientId: string
  operatorId: string
  clientPhone: string
  operatorPhone: string
  ratePerMinute: number
  status: "initiated" | "ringing" | "in-progress" | "completed" | "failed" | "canceled"
  createdAt: Date
  startTime?: Date
  endTime?: Date
  duration?: number // in seconds
  cost?: number
  operatorEarning?: number
  platformFee?: number
  twilioCallSid?: string
  recordingUrl?: string
}
