"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Loader2, CreditCard, Wallet } from "lucide-react"
import { addToWallet } from "@/lib/actions/client.actions"
import { toast } from "sonner"

interface WalletRechargeProps {
  currentBalance: number
  onRechargeComplete?: (newBalance: number) => void
}

export function WalletRecharge({ currentBalance, onRechargeComplete }: WalletRechargeProps) {
  const [amount, setAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [isLoading, setIsLoading] = useState(false)

  const predefinedAmounts = [10, 25, 50, 100, 200]

  const handleRecharge = async () => {
    const rechargeAmount = Number.parseFloat(amount)

    if (!rechargeAmount || rechargeAmount <= 0) {
      toast.error("Please enter a valid amount")
      return
    }

    if (rechargeAmount < 5) {
      toast.error("Minimum recharge amount is €5")
      return
    }

    if (rechargeAmount > 1000) {
      toast.error("Maximum recharge amount is €1000")
      return
    }

    setIsLoading(true)

    try {
      const result = await addToWallet(rechargeAmount, `Wallet recharge via ${paymentMethod}`)

      if (result.success) {
        toast.success(`Successfully added €${rechargeAmount} to your wallet`)
        setAmount("")
        onRechargeComplete?.(result.newBalance)
      } else {
        toast.error(result.error || "Failed to recharge wallet")
      }
    } catch (error) {
      console.error("Recharge error:", error)
      toast.error("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Ricarica Portafoglio
        </CardTitle>
        <CardDescription>
          Saldo attuale: <span className="font-semibold text-green-600">€{currentBalance.toFixed(2)}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Predefined amounts */}
        <div>
          <Label className="text-sm font-medium">Importi rapidi</Label>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {predefinedAmounts.map((presetAmount) => (
              <Button
                key={presetAmount}
                variant={amount === presetAmount.toString() ? "default" : "outline"}
                size="sm"
                onClick={() => setAmount(presetAmount.toString())}
                className="text-sm"
              >
                €{presetAmount}
              </Button>
            ))}
          </div>
        </div>

        {/* Custom amount */}
        <div>
          <Label htmlFor="amount" className="text-sm font-medium">
            Importo personalizzato
          </Label>
          <div className="relative mt-2">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pl-8"
              min="5"
              max="1000"
              step="0.01"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Minimo €5, Massimo €1000</p>
        </div>

        {/* Payment method */}
        <div>
          <Label className="text-sm font-medium">Metodo di pagamento</Label>
          <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="mt-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="card" id="card" />
              <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer">
                <CreditCard className="h-4 w-4" />
                Carta di credito/debito
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="paypal" id="paypal" />
              <Label htmlFor="paypal" className="cursor-pointer">
                PayPal
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="bank" id="bank" />
              <Label htmlFor="bank" className="cursor-pointer">
                Bonifico bancario
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Recharge button */}
        <Button onClick={handleRecharge} disabled={!amount || isLoading} className="w-full" size="lg">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Elaborazione...
            </>
          ) : (
            <>
              <Wallet className="mr-2 h-4 w-4" />
              Ricarica €{amount || "0.00"}
            </>
          )}
        </Button>

        {/* Security notice */}
        <div className="text-xs text-gray-500 text-center">
          <p>🔒 Pagamenti sicuri e crittografati</p>
          <p>I fondi saranno disponibili immediatamente</p>
        </div>
      </CardContent>
    </Card>
  )
}

export default WalletRecharge
