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

      // Questo è il punto più critico per la logica di business.
      // Una volta che Stripe conferma che il pagamento è andato a buon fine,
      // devi aggiornare il tuo database per riflettere questo cambiamento.
      // Ad esempio, se stai usando Supabase:
      //
      // import { createClient } from '@supabase/supabase-js'
      // const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
      //
      // const { data: profile, error } = await supabase
      //   .from('profiles')
      //   .select('wallet_balance')
      //   .eq('id', userId)
      //   .single()
      //
      // if (profile) {
      //   await supabase
      //     .from('profiles')
      //     .update({ wallet_balance: profile.wallet_balance + amount })
      //     .eq('id', userId)
      // }
      //
      // Inoltre, dovresti registrare la transazione in una tabella 'transactions' per lo storico.
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
