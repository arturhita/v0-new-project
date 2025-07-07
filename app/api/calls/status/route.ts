import { type NextRequest, NextResponse } from "next/server"
import { validateTwilioSignature } from "@/lib/twilio"
import { processCallBillingAction } from "@/lib/actions/calls.actions"

export async function POST(request: NextRequest) {
  const body = await request.text()
  const params = new URLSearchParams(body)

  const twilioSignature = request.headers.get("x-twilio-signature") || ""
  const url = process.env.NEXT_PUBLIC_BASE_URL + request.nextUrl.pathname

  const paramsObject = Object.fromEntries(params.entries())

  if (!validateTwilioSignature(twilioSignature, url, paramsObject)) {
    console.error("❌ Signature Twilio non valida")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { CallSid, CallStatus, CallDuration } = paramsObject

  console.log(`📞 Stato Chiamata: ${CallStatus}`, { CallSid, CallDuration })

  if (CallStatus === "completed" && CallDuration) {
    const duration = Number.parseInt(CallDuration, 10)
    await processCallBillingAction(CallSid, duration)
  }

  return new NextResponse(null, { status: 204 })
}
