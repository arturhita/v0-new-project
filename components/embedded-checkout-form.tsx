"use client"

import { Elements } from "@stripe/react-stripe-js"
import { loadStripe, type StripeElementsOptions } from "@stripe/stripe-js"
import CheckoutForm from "@/components/checkout-form"

// Carica la chiave pubblica di Stripe una sola volta
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface EmbeddedCheckoutFormProps {
  clientSecret: string
}

export function EmbeddedCheckoutForm({ clientSecret }: EmbeddedCheckoutFormProps) {
  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: "stripe",
      variables: {
        colorPrimary: "#0ea5e9", // sky-500
        colorBackground: "#ffffff",
        colorText: "#334155", // slate-700
        colorDanger: "#ef4444",
        fontFamily: "Ideal Sans, system-ui, sans-serif",
        spacingUnit: "4px",
        borderRadius: "8px",
      },
    },
  }

  return (
    <div className="w-full mt-6">
      <Elements options={options} stripe={stripePromise}>
        <CheckoutForm />
      </Elements>
    </div>
  )
}
