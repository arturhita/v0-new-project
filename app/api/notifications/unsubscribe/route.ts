import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // In produzione, rimuovi la subscription dal database
    console.log("Rimozione subscription push")

    // Simula rimozione dal database
    // await db.pushSubscriptions.deleteMany({
    //   where: { userId: getCurrentUserId() }
    // })

    return NextResponse.json({
      success: true,
      message: "Subscription rimossa con successo",
    })
  } catch (error) {
    console.error("Errore rimozione subscription:", error)
    return NextResponse.json({ success: false, error: "Errore interno del server" }, { status: 500 })
  }
}
