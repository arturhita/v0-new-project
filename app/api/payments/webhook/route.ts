import { type NextRequest, NextResponse } from "next/server"
import { stripe, STRIPE_WEBHOOK_SECRET } from "@/lib/stripe"
import type Stripe from "stripe"

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get("stripe-signature")!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error("Webhook signature verification failed:", err)
    return NextResponse.json({ error: "Webhook Error" }, { status: 400 })
  }

  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object as Stripe.PaymentIntent

      // Aggiorna il wallet dell'utente
      const userId = paymentIntent.metadata.userId
      const amount = paymentIntent.amount / 100 // Converti da centesimi

      console.log(`Pagamento riuscito: ${amount}€ per utente ${userId}`)

      // Qui dovresti aggiornare il database
      // await updateUserWallet(userId, amount)

      break

    case "payment_intent.payment_failed":
      console.log("Pagamento fallito:", event.data.object)
      break

    default:
      console.log(`Evento non gestito: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}
