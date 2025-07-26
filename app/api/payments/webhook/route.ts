import { stripe } from "@/lib/stripe"
import { createAdminClient } from "@/lib/supabase/admin"
import { headers } from "next/headers"
import { NextResponse } from "next/server"
import type Stripe from "stripe"

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: Request) {
  const body = await req.text()
  const signature = headers().get("stripe-signature")!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err: any) {
    console.error(`❌ Stripe Webhook Error: ${err.message}`)
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 })
  }

  // Gestiamo solo l'evento di sessione di checkout completata
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session

    const { userId, packageId } = session.metadata || {}
    const paymentIntentId = session.payment_intent as string

    // Validazione dei dati ricevuti
    if (!userId || !packageId || !session.amount_total || !paymentIntentId) {
      console.error("❌ Webhook Error: Dati mancanti nella sessione Stripe.", session.id)
      return new NextResponse("Webhook Error: Dati mancanti", { status: 400 })
    }

    try {
      const supabase = createAdminClient()
      const amountInEuros = session.amount_total / 100

      // Chiamiamo la nostra funzione di database sicura
      const { error: rpcError } = await supabase.rpc("add_wallet_balance_and_log_transaction", {
        p_user_id: userId,
        p_amount_euros: amountInEuros,
        p_stripe_payment_intent_id: paymentIntentId,
        p_package_id: packageId,
        p_transaction_metadata: {
          // Salviamo dati utili per riferimento futuro
          stripe_customer_id: session.customer,
          customer_email: session.customer_details?.email,
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
