import { type NextRequest, NextResponse } from "next/server"
import { generateTwiML } from "@/lib/twilio"

export async function POST(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const action = searchParams.get("action")
    const numberToConnect = searchParams.get("number")

    console.log("📞 Richiesta TwiML:", { action, numberToConnect })

    let twiml: string

    if (action === "connect_call" && numberToConnect) {
      twiml = generateTwiML("connect_call", { number: numberToConnect })
    } else {
      twiml = generateTwiML("error")
    }

    return new NextResponse(twiml, {
      headers: { "Content-Type": "text/xml" },
    })
  } catch (error) {
    console.error("❌ Errore TwiML:", error)
    const errorTwiml = generateTwiML("error")
    return new NextResponse(errorTwiml, {
      status: 500,
      headers: { "Content-Type": "text/xml" },
    })
  }
}
