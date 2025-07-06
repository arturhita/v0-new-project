import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const { amount } = await request.json() // Amount in EUR

  if (!amount || typeof amount !== "number" || amount <= 0) {
    return new NextResponse("Invalid amount", { status: 400 })
  }

  const amountInCents = Math.round(amount * 100)

  try {
    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "eur",
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        userId: user.id,
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    })
  } catch (error: any) {
    console.error("Error creating PaymentIntent:", error)
    return new NextResponse(`Internal Server Error: ${error.message}`, { status: 500 })
  }
}
