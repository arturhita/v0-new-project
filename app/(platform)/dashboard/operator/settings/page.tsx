"use client"

import { useEffect, useState } from "react"
import { useFormState, useFormStatus } from "react-dom"
import { createClient } from "@/lib/supabase/client"
import { getOperatorByUserId, updateOperatorFiscalData } from "@/lib/actions/operator.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import type { Operator } from "@/types/database"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Salvataggio..." : "Salva Modifiche"}
    </Button>
  )
}

export default function OperatorSettingsPage() {
  const [operator, setOperator] = useState<Operator | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [formState, formAction] = useFormState(updateOperatorFiscalData, {
    success: false,
    message: "",
  })

  useEffect(() => {
    const fetchOperator = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        try {
          const operatorData = await getOperatorByUserId(user.id)
          if (operatorData) {
            setOperator(operatorData)
          } else {
            setError("Dati operatore non trovati.")
          }
        } catch (e) {
          setError("Errore nel caricamento dei dati operatore.")
        }
      } else {
        setError("Utente non autenticato.")
      }
      setLoading(false)
    }

    fetchOperator()
  }, [])

  useEffect(() => {
    if (formState.message) {
      if (formState.success) {
        toast.success(formState.message)
      } else {
        toast.error(formState.message)
      }
    }
  }, [formState])

  if (loading) {
    return (
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>Dati Fiscali</CardTitle>
            <CardDescription>Caricamento dei tuoi dati fiscali...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="h-10 bg-gray-200 rounded w-full animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded w-full animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded w-full animate-pulse"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6">
      <form action={formAction}>
        <Card>
          <CardHeader>
            <CardTitle>Dati Fiscali</CardTitle>
            <CardDescription>
              Questi dati sono necessari per la fatturazione e i pagamenti. Saranno visibili solo all'amministrazione.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fiscal_code">Codice Fiscale</Label>
                <Input
                  id="fiscal_code"
                  name="fiscal_code"
                  defaultValue={operator?.fiscal_code || ""}
                  placeholder="RSSMRA80A01H501U"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vat_number">Partita IVA (se applicabile)</Label>
                <Input
                  id="vat_number"
                  name="vat_number"
                  defaultValue={operator?.vat_number || ""}
                  placeholder="IT12345678901"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="billing_address">Indirizzo di Fatturazione</Label>
              <Input
                id="billing_address"
                name="billing_address"
                defaultValue={operator?.billing_address || ""}
                placeholder="Via Roma, 1"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="billing_city">Città</Label>
                <Input
                  id="billing_city"
                  name="billing_city"
                  defaultValue={operator?.billing_city || ""}
                  placeholder="Milano"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="billing_zip">CAP</Label>
                <Input
                  id="billing_zip"
                  name="billing_zip"
                  defaultValue={operator?.billing_zip || ""}
                  placeholder="20121"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="billing_country">Paese</Label>
                <Input
                  id="billing_country"
                  name="billing_country"
                  defaultValue={operator?.billing_country || ""}
                  placeholder="Italia"
                  required
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <SubmitButton />
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
