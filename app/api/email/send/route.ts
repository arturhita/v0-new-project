import { type NextRequest, NextResponse } from "next/server"
import { emailService } from "@/lib/email/email-service"

export async function POST(request: NextRequest) {
  try {
    const { to, template, subject, variables } = await request.json()

    const result = await emailService.sendEmail({
      to,
      template,
      subject,
      variables,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Errore invio email:", error)
    return NextResponse.json({ success: false, error: "Errore interno del server" }, { status: 500 })
  }
}
