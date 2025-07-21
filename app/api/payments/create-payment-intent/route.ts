import { stripe } from "@/lib/stripe"
import { packages } from "@/lib/packages"
import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"
import type { Package } from "@/lib/packages"

export async function POST(req: Request) {
  try {
    const { packageId, userId }: { packageId: string; userId: string } = await req.json()

    if (!packageId || !userId) {
      return new NextResponse("ID pacchetto o ID utente mancante", { status: 400 })
    }

    // Verifica che l'utente esista nel database
    const supabase = createAdminClient()
    const { data: user, error: userError } = await supabase.from("profiles").select("id").eq("id", userId).single()

    if (userError || !user) {
      return new NextResponse("Utente non trovato", { status: 404 })
    }

    const selectedPackage: Package | undefined = packages.find((p) => p.id === packageId)

    if (!selectedPackage) {
      return new NextResponse("Pacchetto non trovato", { status: 404 })
    }

    const amountInCents = selectedPackage.price * 100

    // Crea un Payment Intent sul server
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "eur",
      automatic_payment_methods: {
        enabled: true,
      },
      // Passiamo i metadati che ci serviranno nel webhook
      metadata: {
        userId: userId,
        packageId: selectedPackage.id,
        amount: selectedPackage.price,
      },
    })

    // Restituisci solo il client_secret al frontend
    return NextResponse.json({ clientSecret: paymentIntent.client_secret })
  } catch (error: any) {
    console.error("[CREATE_PAYMENT_INTENT_ERROR]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
