import { type NextRequest, NextResponse } from "next/server"
import { smsService } from "@/lib/sms/sms-service"

export async function POST(request: NextRequest) {
  try {
    const { to, message, template, variables } = await request.json()

    const result = await smsService.sendSMS({
      to,
      message,
      template,
      variables,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Errore invio SMS:", error)
    return NextResponse.json({ success: false, error: "Errore interno del server" }, { status: 500 })
  }
}
