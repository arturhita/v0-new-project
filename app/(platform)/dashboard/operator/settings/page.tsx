"use client"

import React, { useEffect } from "react"
import { useFormState, useFormStatus } from "react-dom"
import { toast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { updateOperatorFiscalData, getOperatorByUserId } from "@/lib/actions/operator.actions"
import { useAuth } from "@/contexts/auth-context"
import type { Operator } from "@/types/database"
import { Save, Loader2 } from "lucide-react"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="w-full md:w-auto">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
      {pending ? "Salvataggio in corso..." : "Salva Dati Fiscali"}
    </Button>
  )
}

export default function OperatorSettingsPage() {
  const { user } = useAuth()
  const [operator, setOperator] = React.useState<Operator | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  const [formState, formAction] = useFormState(updateOperatorFiscalData, {
    success: false,
    message: "",
  })

  useEffect(() => {
    if (user?.id) {
      setIsLoading(true)
      getOperatorByUserId(user.id)
        .then((data) => {
          if (data) {
            setOperator(data)
          }
        })
        .finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (formState.message) {
      toast({
        title: formState.success ? "Successo" : "Errore",
        description: formState.message,
        variant: formState.success ? "default" : "destructive",
      })
    }
  }, [formState])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
      </div>
    )
  }

  if (!operator) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Errore</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Impossibile caricare i dati dell'operatore. Assicurati di aver completato il tuo profilo.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-800">Impostazioni Fiscali</h1>
        <p className="text-slate-500">
          Inserisci i tuoi dati per la fatturazione. Queste informazioni saranno visibili solo all'amministrazione.
        </p>
      </div>
      <form action={formAction}>
        <Card>
          <CardHeader>
            <CardTitle>Dati di Fatturazione</CardTitle>
            <CardDescription>
              Assicurati che i dati siano corretti. Verranno utilizzati per generare le fatture dei tuoi compensi.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fiscal_code">Codice Fiscale</Label>
              <Input id="fiscal_code" name="fiscal_code" defaultValue={operator.fiscal_code || ""} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vat_number">Partita IVA (se applicabile)</Label>
              <Input id="vat_number" name="vat_number" defaultValue={operator.vat_number || ""} />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="billing_address">Indirizzo di Fatturazione</Label>
              <Input
                id="billing_address"
                name="billing_address"
                defaultValue={operator.billing_address || ""}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="billing_city">Città</Label>
              <Input id="billing_city" name="billing_city" defaultValue={operator.billing_city || ""} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="billing_zip">CAP</Label>
              <Input id="billing_zip" name="billing_zip" defaultValue={operator.billing_zip || ""} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="billing_country">Paese</Label>
              <Input
                id="billing_country"
                name="billing_country"
                defaultValue={operator.billing_country || "Italia"}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <SubmitButton />
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
