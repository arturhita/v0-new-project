"use server"

import { stripe } from "@/lib/stripe"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// Crea un account Stripe Connect per un operatore
export async function createStripeConnectAccount(): Promise<{ success: boolean; error?: string; onboardingUrl?: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Utente non autenticato." }

  try {
    const account = await stripe.accounts.create({
      type: "express",
      email: user.email,
      country: "IT",
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    })

    await supabaseAdmin
      .from("profiles")
      .update({ stripe_account_id: account.id, stripe_account_status: "pending" })
      .eq("user_id", user.id)

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/operator/payouts`,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/operator/payouts`,
      type: "account_onboarding",
    })

    revalidatePath("/dashboard/operator/payouts")
    return { success: true, onboardingUrl: accountLink.url }
  } catch (error: any) {
    console.error("Errore creazione account Stripe Connect:", error)
    return { success: false, error: error.message }
  }
}

// Richiede un pagamento per l'operatore
export async function requestPayoutAction(amount: number): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Utente non autenticato." }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("earnings_balance, stripe_account_status")
    .eq("user_id", user.id)
    .single()

  if (profileError || !profile) return { success: false, error: "Profilo non trovato." }
  if (profile.stripe_account_status !== "verified") return { success: false, error: "Il tuo account Stripe non è ancora verificato." }
  if (amount <= 0) return { success: false, error: "L'importo deve essere positivo." }
  if (profile.earnings_balance < amount) return { success: false, error: "Saldo insufficiente per richiedere questo importo." }

  const { error: payoutError } = await supabaseAdmin.from("payouts").insert({
    operator_id: user.id,
    amount: amount,
    status: "pending",
    currency: "eur",
  })

  if (payoutError) {
    console.error("Errore richiesta payout:", payoutError)
    return { success: false, error: "Impossibile creare la richiesta di payout." }
  }

  // Sottrae l'importo richiesto dal saldo guadagni
  await supabaseAdmin
    .from("profiles")
    .update({ earnings_balance: profile.earnings_balance - amount })
    .eq("user_id", user.id)

  revalidatePath("/dashboard/operator/payouts")
  return { success: true }
}
