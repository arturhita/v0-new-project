"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"

const rechargeOptions = [10, 25, 50, 100]

export default function WalletRecharge({ currentBalance }: { currentBalance: number }) {
  const [amount, setAmount] = useState("25")
  const [customAmount, setCustomAmount] = useState("")

  const handleRecharge = () => {
    const finalAmount = amount === "custom" ? customAmount : amount
    // Qui andrà la logica per processare il pagamento con Stripe o un altro provider
    console.log(`Avvio ricarica di €${finalAmount}`)
    alert(`Ricarica di €${finalAmount} avviata! (Logica da implementare)`)
  }

  const selectedAmount = amount === "custom" ? Number.parseFloat(customAmount) || 0 : Number.parseFloat(amount)
  const newBalance = currentBalance + selectedAmount

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-lg font-semibold">Scegli l'importo da ricaricare</Label>
        <RadioGroup value={amount} onValueChange={setAmount} className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {rechargeOptions.map((option) => (
            <div key={option}>
              <RadioGroupItem value={String(option)} id={`recharge-${option}`} className="peer sr-only" />
              <Label
                htmlFor={`recharge-${option}`}
                className={cn(
                  "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground",
                  "peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary",
                )}
              >
                €{option}
              </Label>
            </div>
          ))}
          <div>
            <RadioGroupItem value="custom" id="recharge-custom" className="peer sr-only" />
            <Label
              htmlFor="recharge-custom"
              className={cn(
                "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground",
                "peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary",
              )}
            >
              Altro
            </Label>
          </div>
        </RadioGroup>
      </div>

      {amount === "custom" && (
        <div>
          <Label htmlFor="custom-amount">Importo Personalizzato (€)</Label>
          <Input
            id="custom-amount"
            type="number"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            placeholder="Es. 30"
            className="mt-2"
          />
        </div>
      )}

      <div className="p-4 rounded-lg border bg-background/50">
        <div className="flex justify-between text-sm">
          <span>Saldo attuale:</span>
          <span>€{currentBalance.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Importo ricarica:</span>
          <span>+ €{selectedAmount.toFixed(2)}</span>
        </div>
        <hr className="my-2" />
        <div className="flex justify-between font-bold text-lg">
          <span>Nuovo saldo:</span>
          <span>€{newBalance.toFixed(2)}</span>
        </div>
      </div>

      <Button onClick={handleRecharge} size="lg" className="w-full">
        Ricarica €{selectedAmount.toFixed(2)}
      </Button>
    </div>
  )
}
