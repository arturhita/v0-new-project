import { type NextRequest, NextResponse } from "next/server"
import { validateTwilioSignature } from "@/lib/twilio"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const params = Object.fromEntries(formData.entries())

    // Valida signature Twilio
    const signature = request.headers.get("x-twilio-signature") || ""
    const url = request.url

    if (!validateTwilioSignature(signature, url, params)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { CallSid, RecordingUrl, RecordingStatus, RecordingDuration } = params

    console.log("🎙️ Recording Status:", {
      CallSid,
      RecordingUrl,
      RecordingStatus,
      RecordingDuration,
    })

    // Salva informazioni registrazione nel database
    // await saveRecordingInfo(CallSid, RecordingUrl, RecordingStatus, RecordingDuration)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("❌ Recording status webhook error:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
