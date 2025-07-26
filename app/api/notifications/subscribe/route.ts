import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const subscription = await request.json()

    // In produzione, salva la subscription nel database
    console.log("Nuova subscription push:", subscription)

    // Simula salvataggio nel database
    // await db.pushSubscriptions.create({
    //   endpoint: subscription.endpoint,
    //   p256dh: subscription.keys.p256dh,
    //   auth: subscription.keys.auth,
    //   userId: getCurrentUserId()
    // })

    return NextResponse.json({
      success: true,
      message: "Subscription salvata con successo",
    })
  } catch (error) {
    console.error("Errore salvataggio subscription:", error)
    return NextResponse.json({ success: false, error: "Errore interno del server" }, { status: 500 })
  }
}
