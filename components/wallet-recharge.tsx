"use client"

import type React from "react"

import { useState } from "react"
import { PaymentElement, Elements, useStripe, useElements } from "@stripe/react-stripe-js"
import { loadStripe, type StripeElementsOptions } from "@stripe/stripe-js"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

function CheckoutForm() {
  const stripe = useStripe()
  const elements = useElements()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)

    if (!stripe || !elements) {
      toast.error("Stripe non è stato caricato correttamente.")
      setIsLoading(false)
      return
    }

    const { error: submitError } = await elements.submit()
    if (submitError) {
      toast.error(submitError.message)
      setIsLoading(false)
      return
    }

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/dashboard/client/wallet?recharge=success`,
      },
    })

    if (error) {
      toast.error(error.message)
    }

    setIsLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <Button disabled={isLoading || !stripe || !elements} className="w-full" type="submit">
        {isLoading ? "Pagamento in corso..." : "Paga Adesso"}
      </Button>
    </form>
  )
}

export function WalletRecharge() {
  const [amount, setAmount] = useState(10)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleAmountSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    toast.info("Creazione sessione di pagamento...")

    try {
      const res = await fetch("/api/payments/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      })

      if (!res.ok) {
        const error = await res.text()
        throw new Error(error || "Errore nella creazione del pagamento.")
      }

      const data = await res.json()
      setClientSecret(data.clientSecret)
      toast.success("Sessione creata. Inserisci i dati di pagamento.")
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const options: StripeElementsOptions = {
    clientSecret: clientSecret || undefined,
    appearance: { theme: "night" },
  }

  if (clientSecret) {
    return (
      <Elements stripe={stripePromise} options={options}>
        <CheckoutForm />
      </Elements>
    )
  }

  return (
    <form onSubmit={handleAmountSubmit} className="space-y-4">
      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-slate-300 mb-1">
          Importo Ricarica (€)
        </label>
        <Input
          id="amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          min="5"
          step="1"
          className="bg-slate-800 border-slate-600 text-white"
        />
      </div>
      <Button type="submit" disabled={isLoading} className="w-full bg-purple-600 hover:bg-purple-700">
        {isLoading ? "Inizializzazione..." : "Procedi al Pagamento"}
      </Button>
    </form>
  )
}
