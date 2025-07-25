import { type NextRequest, NextResponse } from "next/server"
import { validateTwilioSignature } from "@/lib/twilio"
import { processCallBillingAction } from "@/lib/actions/calls.actions"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const params = Object.fromEntries(formData.entries())

    // Valida signature Twilio
    const signature = request.headers.get("x-twilio-signature") || ""
    const url = request.url

    if (!validateTwilioSignature(signature, url, params)) {
      console.error("❌ Invalid Twilio signature")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { CallSid, CallStatus, CallDuration, From, To } = params

    console.log("📞 Call Status Update:", {
      CallSid,
      CallStatus,
      CallDuration,
      From,
      To,
    })

    // Gestisci diversi stati della chiamata
    switch (CallStatus) {
      case "completed":
        // Processa billing quando la chiamata è completata
        if (CallDuration) {
          const duration = Number.parseInt(CallDuration as string)
          // Trova sessione per CallSid (mock)
          const sessionId = `call_${Date.now()}` // Mock - dovrebbe essere recuperato dal DB

          await processCallBillingAction(sessionId, duration)
        }
        break

      case "busy":
      case "no-answer":
      case "failed":
        console.log(`📞 Call ${CallStatus}:`, CallSid)
        // Gestisci chiamate non riuscite
        break

      case "in-progress":
        console.log("📞 Call started:", CallSid)
        // Avvia billing real-time se necessario
        break
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("❌ Call status webhook error:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
