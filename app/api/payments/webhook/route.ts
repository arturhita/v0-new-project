import { stripe, STRIPE_WEBHOOK_SECRET } from "@/lib/stripe"
import { createAdminClient } from "@/lib/supabase/admin"
import { headers } from "next/headers"
import { NextResponse } from "next/server"
import type Stripe from "stripe"

export async function POST(req: Request) {
  const body = await req.text()
  const signature = headers().get("stripe-signature")!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET)
  } catch (err: any) {
    console.error(`❌ Stripe Webhook Error: ${err.message}`)
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 })
  }

  // Gestiamo l'evento di pagamento riuscito
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent

    const { userId, packageId } = paymentIntent.metadata || {}
    const paymentIntentId = paymentIntent.id

    if (!userId || !packageId || !paymentIntent.amount || !paymentIntentId) {
      console.error("❌ Webhook Error: Dati mancanti nei metadati del Payment Intent.", paymentIntent.id)
      return new NextResponse("Webhook Error: Dati mancanti", { status: 400 })
    }

    try {
      const supabase = createAdminClient()
      const amountInEuros = paymentIntent.amount / 100

      // Chiamiamo la nostra funzione di database sicura
      const { error: rpcError } = await supabase.rpc("add_wallet_balance_and_log_transaction", {
        p_user_id: userId,
        p_amount_euros: amountInEuros,
        p_stripe_payment_intent_id: paymentIntentId,
        p_package_id: packageId,
        p_transaction_metadata: {
          stripe_customer_id: paymentIntent.customer,
          customer_email: paymentIntent.receipt_email,
        },
      })

      if (rpcError) {
        console.error("❌ Supabase RPC Error:", rpcError)
        return new NextResponse(`Webhook Error: Errore durante l'aggiornamento del database.`, { status: 500 })
      }

      console.log(
        `✅ Pagamento processato con successo per l'utente ${userId}. Aggiunti ${amountInEuros}€ al portafoglio.`,
      )
    } catch (err: any) {
      console.error("❌ Errore nel gestore del webhook:", err)
      return new NextResponse(`Webhook handler error: ${err.message}`, { status: 500 })
    }
  }

  // Rispondiamo a Stripe con successo per confermare la ricezione
  return new NextResponse(null, { status: 200 })
}
