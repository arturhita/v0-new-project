"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { getOperatorPayoutMethods, saveOperatorPayoutMethod } from "@/lib/actions/payouts.actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Trash2, CheckCircle } from "lucide-react"
import type { PayoutMethod } from "@/types/database.types"

export default function PayoutSettingsPage() {
  const { profile } = useAuth()
  const { toast } = useToast()
  const [methods, setMethods] = useState<PayoutMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState("paypal")

  useEffect(() => {
    if (profile?.id) {
      getOperatorPayoutMethods(profile.id)
        .then(setMethods)
        .finally(() => setLoading(false))
    }
  }, [profile])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!profile) return

    setIsSubmitting(true)
    const formData = new FormData(event.currentTarget)
    const result = await saveOperatorPayoutMethod(profile.id, formData)

    if (result.success) {
      toast({ title: "Successo", description: result.message })
      // Refresh methods
      getOperatorPayoutMethods(profile.id).then(setMethods)
    } else {
      toast({ title: "Errore", description: result.message, variant: "destructive" })
    }
    setIsSubmitting(false)
  }

  if (loading) {
    return <Loader2 className="mx-auto mt-8 h-8 w-8 animate-spin" />
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Impostazioni di Pagamento</h1>
        <p className="text-gray-400">Gestisci come vuoi ricevere i tuoi guadagni.</p>
      </div>

      <Card className="bg-gray-800/50 border-gray-700/50">
        <CardHeader>
          <CardTitle>Metodi di Pagamento Salvati</CardTitle>
          <CardDescription>Questi sono i metodi che possiamo usare per inviarti i soldi.</CardDescription>
        </CardHeader>
        <CardContent>
          {methods.length > 0 ? (
            <ul className="space-y-3">
              {methods.map((method) => (
                <li
                  key={method.id}
                  className="flex items-center justify-between rounded-md border border-gray-700 bg-gray-800 p-4"
                >
                  <div>
                    <p className="font-semibold capitalize">{method.method_type}</p>
                    <p className="text-sm text-gray-400">
                      {method.method_type === "paypal"
                        ? method.details.email
                        : `IBAN: ****${method.details.iban.slice(-4)}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    {method.is_default && (
                      <span className="flex items-center gap-1 text-xs text-green-400">
                        <CheckCircle className="h-4 w-4" />
                        Default
                      </span>
                    )}
                    <Button variant="destructive" size="icon" disabled>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500">Nessun metodo di pagamento salvato.</p>
          )}
        </CardContent>
      </Card>

      <Card className="bg-gray-800/50 border-gray-700/50">
        <CardHeader>
          <CardTitle>Aggiungi Nuovo Metodo</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label>Tipo di Metodo</Label>
              <div className="mt-2 flex gap-4">
                <Button
                  type="button"
                  variant={selectedMethod === "paypal" ? "secondary" : "outline"}
                  onClick={() => setSelectedMethod("paypal")}
                  className="border-indigo-500"
                >
                  PayPal
                </Button>
                <Button
                  type="button"
                  variant={selectedMethod === "iban" ? "secondary" : "outline"}
                  onClick={() => setSelectedMethod("iban")}
                  className="border-indigo-500"
                >
                  Bonifico Bancario (IBAN)
                </Button>
              </div>
              <input type="hidden" name="method_type" value={selectedMethod} />
            </div>

            {selectedMethod === "paypal" && (
              <div className="space-y-2">
                <Label htmlFor="paypal_email">Email PayPal</Label>
                <Input
                  id="paypal_email"
                  name="paypal_email"
                  type="email"
                  required
                  placeholder="tua.email@example.com"
                />
              </div>
            )}

            {selectedMethod === "iban" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="iban_account_holder">Intestatario Conto</Label>
                  <Input id="iban_account_holder" name="iban_account_holder" required placeholder="Mario Rossi" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="iban_number">IBAN</Label>
                  <Input id="iban_number" name="iban_number" required placeholder="IT60X0542811101000000123456" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="iban_bank_name">Nome Banca</Label>
                  <Input id="iban_bank_name" name="iban_bank_name" required placeholder="Nome della tua banca" />
                </div>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Switch id="is_default" name="is_default" />
              <Label htmlFor="is_default">Imposta come metodo di pagamento predefinito</Label>
            </div>

            <Button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salva Metodo
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
