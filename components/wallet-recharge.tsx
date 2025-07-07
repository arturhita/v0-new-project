"use client"

import type React from "react"
import { useState } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CreditCard, Loader2, AlertTriangle } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
const stripePromise = publishableKey ? loadStripe(publishableKey) : null

interface PaymentFormProps {
  onSuccess: (amount: number) => void
}

function PaymentForm({ onSuccess }: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [amount, setAmount] = useState("20")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) return

    const cardElement = elements.getElement(CardElement)
    if (!cardElement) return

    setLoading(true)

    try {
      // Crea PaymentIntent
      const response = await fetch("/api/payments/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number.parseFloat(amount) * 100, // Converti in centesimi
          userId: "user123", // Sostituisci con ID utente reale
        }),
      })

      const { clientSecret, error } = await response.json()

      if (error) {
        toast({ title: "Errore", description: error, variant: "destructive" })
        setLoading(false)
        return
      }

      // Conferma il pagamento
      const { error: confirmError } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: "Cliente Test", // Sostituire con dati reali
          },
        },
      })

      if (confirmError) {
        toast({
          title: "Pagamento Fallito",
          description: confirmError.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Pagamento Riuscito!",
          description: `Hai ricaricato €${amount} nel tuo wallet`,
        })
        onSuccess(Number.parseFloat(amount))
      }
    } catch (error) {
      console.error("Errore pagamento:", error)
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante il pagamento",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="amount">Importo da ricaricare (€)</Label>
        <Input
          id="amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min="0.50"
          step="0.50"
          className="mt-1"
        />
      </div>

      <div>
        <Label>Dati Carta di Credito</Label>
        <div className="mt-1 p-3 border rounded-md bg-white">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: "#333",
                  "::placeholder": {
                    color: "#aab7c4",
                  },
                },
                invalid: {
                  color: "#fa755a",
                  iconColor: "#fa755a",
                },
              },
            }}
          />
        </div>
      </div>

      <Button type="submit" disabled={!stripe || loading} className="w-full bg-gradient-to-r from-sky-500 to-cyan-600">
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Elaborazione...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Ricarica €{amount}
          </>
        )}
      </Button>
    </form>
  )
}

interface WalletRechargeProps {
  currentBalance: number
  onBalanceUpdate: (newBalance: number) => void
}

export function WalletRecharge({ currentBalance, onBalanceUpdate }: WalletRechargeProps) {
  const handlePaymentSuccess = (amount: number) => {
    onBalanceUpdate(currentBalance + amount)
  }

  if (!stripePromise) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Ricarica Wallet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-md">
            <AlertTriangle className="h-5 w-5" />
            <p>Il servizio di ricarica non è configurato correttamente.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Ricarica Wallet
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-3 bg-sky-50 rounded-lg">
          <p className="text-sm text-sky-700">
            Saldo attuale: <span className="font-bold">€{currentBalance.toFixed(2)}</span>
          </p>
        </div>

        <Elements stripe={stripePromise}>
          <PaymentForm onSuccess={handlePaymentSuccess} />
        </Elements>
      </CardContent>
    </Card>
  )
}
