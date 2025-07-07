import { type NextRequest, NextResponse } from "next/server"
import { generateTwiML } from "@/lib/twilio"

export async function POST(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const action = searchParams.get("action")
    const sessionId = searchParams.get("session")

    console.log("📞 TwiML Request:", { action, sessionId })

    let twiml: string

    switch (action) {
      case "connect_call":
        // Connetti alla chiamata dell'operatore
        twiml = generateTwiML("connect_call", {
          number: "+393337654321", // Mock numero operatore
        })
        break

      case "operator_busy":
        twiml = generateTwiML("operator_busy")
        break

      case "insufficient_credit":
        twiml = generateTwiML("insufficient_credit")
        break

      default:
        twiml = generateTwiML("error")
    }

    return new NextResponse(twiml, {
      headers: {
        "Content-Type": "text/xml",
      },
    })
  } catch (error) {
    console.error("❌ TwiML Error:", error)

    const errorTwiml = generateTwiML("error")
    return new NextResponse(errorTwiml, {
      status: 500,
      headers: {
        "Content-Type": "text/xml",
      },
    })
  }
}

export async function GET(request: NextRequest) {
  return POST(request)
}
