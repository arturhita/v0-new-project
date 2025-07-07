import { type NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"

export async function POST(request: NextRequest) {
  try {
    const { amount, currency = "eur", userId } = await request.json()

    if (!amount || amount < 50) {
      // Minimo 0.50€
      return NextResponse.json({ error: "Importo minimo 0.50€" }, { status: 400 })
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // Stripe usa centesimi
      currency,
      metadata: {
        userId,
        type: "wallet_recharge",
      },
      automatic_payment_methods: {
        enabled: true,
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    })
  } catch (error) {
    console.error("Errore creazione PaymentIntent:", error)
    return NextResponse.json({ error: "Errore interno del server" }, { status: 500 })
  }
}
