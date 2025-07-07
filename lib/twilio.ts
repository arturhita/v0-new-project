// NOTA: Questo file non importa più la libreria 'twilio' per evitare errori di compatibilità.

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

// --- Funzioni API che sostituiscono il Twilio SDK ---

const TWILIO_API_BASE_URL = `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}`

// Funzione per ottenere l'header di autorizzazione Basic Auth
function getAuthHeader(): string {
  const credentials = `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`
  // btoa è una funzione globale per la codifica Base64
  return `Basic ${btoa(credentials)}`
}

/**
 * Crea una nuova chiamata tramite l'API REST di Twilio.
 * Sostituisce twilioClient.calls.create
 */
export async function createTwilioCall(
  to: string,
  twimlUrl: string,
  statusCallbackUrl: string,
): Promise<{ sid: string }> {
  const body = new URLSearchParams()
  body.append("To", to)
  body.append("From", process.env.TWILIO_PHONE_NUMBER!)
  body.append("Url", twimlUrl)
  body.append("StatusCallback", statusCallbackUrl)
  body.append("StatusCallbackEvent", "initiated")
  body.append("StatusCallbackEvent", "ringing")
  body.append("StatusCallbackEvent", "answered")
  body.append("StatusCallbackEvent", "completed")
  body.append("StatusCallbackMethod", "POST")

  const response = await fetch(`${TWILIO_API_BASE_URL}/Calls.json`, {
    method: "POST",
    headers: {
      Authorization: getAuthHeader(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  })

  if (!response.ok) {
    const errorData = await response.json()
    console.error("Twilio API Error (createCall):", errorData)
    throw new Error(errorData.message || "Impossibile creare la chiamata con Twilio.")
  }

  const data = await response.json()
  return { sid: data.sid }
}

/**
 * Termina una chiamata in corso tramite l'API REST di Twilio.
 * Sostituisce twilioClient.calls(sid).update
 */
export async function endTwilioCall(sid: string): Promise<void> {
  const body = new URLSearchParams()
  body.append("Status", "completed")

  const response = await fetch(`${TWILIO_API_BASE_URL}/Calls/${sid}.json`, {
    method: "POST",
    headers: {
      Authorization: getAuthHeader(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  })

  if (!response.ok) {
    const errorData = await response.json()
    // Non lanciare un errore se la chiamata è già terminata (caso comune)
    if (errorData.code !== 21220) {
      // 21220 = Call is not in-progress or queued
      console.error("Twilio API Error (endCall):", errorData)
      throw new Error(errorData.message || "Impossibile terminare la chiamata con Twilio.")
    }
  }
}

/**
 * Genera manualmente il codice XML TwiML per le risposte a Twilio.
 * Sostituisce twilio.twiml.VoiceResponse
 */
export function generateTwiML(action: string, params?: any): string {
  const callerId = process.env.TWILIO_PHONE_NUMBER!
  let content = ""

  switch (action) {
    case "connect_call":
      content = `
        <Say language="it-IT">Connessione in corso con il tuo consulente...</Say>
        <Dial callerId="${callerId}">
          <Number>${params.number}</Number>
        </Dial>
      `
      break
    case "operator_busy":
      content = `<Say language="it-IT">Il consulente non è al momento disponibile. Riprova più tardi.</Say><Hangup />`
      break
    case "insufficient_credit":
      content = `<Say language="it-IT">Credito insufficiente per effettuare la chiamata.</Say><Hangup />`
      break
    default:
      content = `<Say language="it-IT">Errore nel sistema. Riprova più tardi.</Say><Hangup />`
  }

  return `<?xml version="1.0" encoding="UTF-8"?><Response>${content.trim()}</Response>`
}
