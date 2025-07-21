"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CreditCard, Euro } from "lucide-react"
import { loadStripe } from "@stripe/stripe-js"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface WalletRechargeProps {
  currentBalance: number
  onRechargeComplete?: () => void
}

export function WalletRecharge({ currentBalance, onRechargeComplete }: WalletRechargeProps) {
  const [amount, setAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const predefinedAmounts = [10, 25, 50, 100]

  const handleRecharge = async (rechargeAmount: number) => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/payments/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: rechargeAmount * 100, // Convert to cents
          currency: "eur",
          type: "wallet_recharge",
        }),
      })

      const { clientSecret } = await response.json()

      const stripe = await stripePromise
      if (!stripe) throw new Error("Stripe not loaded")

      const { error } = await stripe.confirmPayment({
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard/client/wallet?success=true`,
        },
      })

      if (error) {
        console.error("Payment failed:", error)
      } else {
        onRechargeComplete?.()
      }
    } catch (error) {
      console.error("Error processing payment:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Ricarica Portafoglio
        </CardTitle>
        <CardDescription>Saldo attuale: €{currentBalance.toFixed(2)}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          {predefinedAmounts.map((presetAmount) => (
            <Button
              key={presetAmount}
              variant="outline"
              onClick={() => handleRecharge(presetAmount)}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <Euro className="h-4 w-4" />
              {presetAmount}
            </Button>
          ))}
        </div>

        <div className="space-y-2">
          <Label htmlFor="custom-amount">Importo personalizzato</Label>
          <div className="flex gap-2">
            <Input
              id="custom-amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
              step="0.01"
            />
            <Button
              onClick={() => handleRecharge(Number.parseFloat(amount))}
              disabled={isLoading || !amount || Number.parseFloat(amount) < 1}
            >
              Ricarica
            </Button>
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          <p>• Importo minimo: €1.00</p>
          <p>• I pagamenti sono sicuri e crittografati</p>
          <p>• Il credito non ha scadenza</p>
        </div>
      </CardContent>
    </Card>
  )
}
