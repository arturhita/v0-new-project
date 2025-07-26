import { stripe } from "@/lib/stripe"
import { packages } from "@/lib/packages"
import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { packageId, userId } = await req.json()

    if (!packageId || !userId) {
      return new NextResponse("Missing packageId or userId", { status: 400 })
    }

    // Verifica che l'utente esista
    const supabase = createAdminClient()
    const { data: user, error: userError } = await supabase.from("profiles").select("id").eq("id", userId).single()
    if (userError || !user) {
      return new NextResponse("User not found", { status: 404 })
    }

    const selectedPackage = packages.find((p) => p.id === packageId)
    if (!selectedPackage) {
      return new NextResponse("Package not found", { status: 404 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: selectedPackage.stripePriceId,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/(platform)/dashboard/client/wallet?payment=success`,
      cancel_url: `${baseUrl}/(platform)/dashboard/client/wallet?payment=cancelled`,
      // Passiamo i dati necessari al webhook per l'accredito
      metadata: {
        userId: userId,
        packageId: selectedPackage.id,
      },
    })

    return NextResponse.json({ sessionId: session.id })
  } catch (error: any) {
    console.error("[CREATE_PAYMENT_INTENT_ERROR]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
