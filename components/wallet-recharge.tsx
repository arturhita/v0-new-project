"use client"

import type React from "react"

import { useState } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"
import { createClient } from "@/lib/supabase/client"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: "#32325d",
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: "antialiased",
      fontSize: "16px",
      "::placeholder": {
        color: "#aab7c4",
      },
    },
    invalid: {
      color: "#fa755a",
      iconColor: "#fa755a",
    },
  },
}

function CheckoutForm() {
  const [amount, setAmount] = useState(10) // Default amount
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const stripe = useStripe()
  const elements = useElements()
  const { user } = useAuth()
  const supabase = createClient()

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    if (!stripe || !elements || !user) {
      setError("Stripe non è stato caricato correttamente o non sei autenticato.")
      setLoading(false)
      return
    }

    const cardElement = elements.getElement(CardElement)
    if (!cardElement) {
      setError("Elemento carta non trovato.")
      setLoading(false)
      return
    }

    try {
      // 1. Create a Payment Intent on the server
      const response = await fetch("/api/payments/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amount * 100, userId: user.id }), // amount in cents
      })

      const { clientSecret, error: intentError } = await response.json()

      if (intentError) {
        throw new Error(intentError)
      }

      // 2. Confirm the payment on the client
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            email: user.email,
          },
        },
      })

      if (stripeError) {
        throw stripeError
      }

      if (paymentIntent?.status === "succeeded") {
        setSuccess(`Ricarica di ${amount}€ completata con successo!`)
        // The webhook will handle updating the user's wallet balance.
        // You might want to trigger a re-fetch of the user's wallet here.
      } else {
        setError(`Stato del pagamento: ${paymentIntent?.status}`)
      }
    } catch (err: any) {
      setError(err.message || "Si è verificato un errore imprevisto.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="amount">Importo Ricarica (€)</Label>
        <Input
          id="amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          min="5"
          step="1"
          required
        />
      </div>
      <div>
        <Label>Dati della Carta</Label>
        <div className="p-2 border rounded-md">
          <CardElement options={CARD_ELEMENT_OPTIONS} />
        </div>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      {success && <p className="text-sm text-green-500">{success}</p>}
      <Button type="submit" disabled={!stripe || loading} className="w-full">
        {loading ? "Pagamento in corso..." : `Paga ${amount}€`}
      </Button>
    </form>
  )
}

export function WalletRecharge() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  )
}
