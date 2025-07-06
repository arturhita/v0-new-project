import { NextResponse } from "next/server"
import type Stripe from "stripe"
import { stripe } from "@/lib/stripe"
import { createClient } from "@supabase/supabase-js"

// Usiamo un client Supabase con il service_role key per avere i permessi di scrittura
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: Request) {
  const body = await request.text()
  const sig = request.headers.get("stripe-signature") as string
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!sig || !webhookSecret) {
    return new NextResponse("Webhook secret not configured", { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`)
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 })
  }

  // Gestisci l'evento
  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      const userId = paymentIntent.metadata.userId
      const amountCents = paymentIntent.amount_received

      if (!userId || !amountCents) {
        console.error("Webhook received payment_intent.succeeded without userId or amount.")
        return new NextResponse("Missing metadata", { status: 400 })
      }

      try {
        // 1. Trova il portafoglio dell'utente
        const { data: wallet, error: walletError } = await supabaseAdmin
          .from("wallets")
          .select("id, balance_cents")
          .eq("user_id", userId)
          .single()

        if (walletError || !wallet) {
          throw new Error(`Wallet not found for user ${userId}: ${walletError?.message}`)
        }

        // 2. Aggiorna il saldo del portafoglio
        const newBalance = wallet.balance_cents + amountCents
        const { error: updateError } = await supabaseAdmin
          .from("wallets")
          .update({ balance_cents: newBalance })
          .eq("id", wallet.id)

        if (updateError) {
          throw new Error(`Failed to update wallet ${wallet.id}: ${updateError.message}`)
        }

        // 3. Crea un record di transazione
        const { error: transactionError } = await supabaseAdmin.from("transactions").insert({
          wallet_id: wallet.id,
          amount_cents: amountCents,
          type: "credit",
          description: "Ricarica portafoglio",
          metadata: {
            stripe_payment_intent_id: paymentIntent.id,
          },
        })

        if (transactionError) {
          // Nota: qui potresti voler implementare una logica di retry o notifica
          throw new Error(`Failed to create transaction for wallet ${wallet.id}: ${transactionError.message}`)
        }

        console.log(`Wallet ${wallet.id} for user ${userId} credited with ${amountCents} cents.`)
      } catch (dbError: any) {
        console.error("Database error handling successful payment:", dbError.message)
        return new NextResponse(`Webhook handler failed: ${dbError.message}`, { status: 500 })
      }

      break
    default:
      console.log(`Unhandled event type ${event.type}`)
  }

  return NextResponse.json({ received: true })
}
