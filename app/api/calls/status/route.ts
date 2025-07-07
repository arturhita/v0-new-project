import { type NextRequest, NextResponse } from "next/server"
import { processCallBillingAction, updateCallStatusAction } from "@/lib/actions/calls.actions"

export async function POST(request: NextRequest) {
  try {
    // Twilio invia i dati in formato 'x-www-form-urlencoded'
    const formData = await request.formData()
    const body = Object.fromEntries(formData)

    const callSid = body.CallSid as string
    const callStatus = body.CallStatus as "ringing" | "in-progress" | "completed" | "canceled" | "failed" | "no-answer"
    const callDuration = body.CallDuration ? Number.parseInt(body.CallDuration as string, 10) : 0

    console.log(`[Status Webhook] Ricevuto stato: ${callStatus} per CallSid: ${callSid}`)

    if (callStatus === "completed") {
      // La chiamata è terminata, processiamo la fatturazione finale.
      await processCallBillingAction(callSid, callDuration)
    } else {
      // Per altri stati come 'in-progress', aggiorniamo solo la sessione.
      await updateCallStatusAction(callSid, callStatus)
    }

    // IMPORTANTE: Rispondiamo a Twilio con una risposta TwiML vuota per confermare la ricezione.
    // Questo previene l'errore "TwiML response body too large".
    return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><Response/>', {
      status: 200,
      headers: {
        "Content-Type": "text/xml",
      },
    })
  } catch (error: any) {
    console.error("❌ Errore nel webhook /api/calls/status:", error)
    // Se si verifica un errore, inviamo comunque una risposta vuota valida a Twilio
    // per evitare di causare ulteriori errori da parte loro.
    return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><Response/>', {
      status: 500, // Internal Server Error
      headers: {
        "Content-Type": "text/xml",
      },
    })
  }
}
