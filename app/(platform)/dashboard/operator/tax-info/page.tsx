"use client"

import type React from "react"

import { useEffect, useState, useTransition } from "react"
import { createClient } from "@/lib/supabase/client"
import { getOperatorTaxDetails, saveOperatorTaxDetails } from "@/lib/actions/operator.actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import type { OperatorTaxDetails } from "@/types/database.types"

export default function TaxInfoPage() {
  const supabase = createClient()
  const { toast } = useToast()
  const [taxDetails, setTaxDetails] = useState<OperatorTaxDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, startTransition] = useTransition()
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserAndDetails = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        setLoading(true)
        getOperatorTaxDetails(user.id)
          .then(setTaxDetails)
          .finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    }
    fetchUserAndDetails()
  }, [supabase])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!userId) return

    const formData = new FormData(event.currentTarget)
    startTransition(async () => {
      const result = await saveOperatorTaxDetails(userId, formData)
      if (result.success) {
        toast({ title: "Successo", description: result.message })
      } else {
        toast({ title: "Errore", description: result.message, variant: "destructive" })
      }
    })
  }

  if (loading) {
    return <Loader2 className="mx-auto mt-8 h-8 w-8 animate-spin text-primary" />
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Dati Fiscali</h1>
        <p className="text-gray-400">
          Queste informazioni sono confidenziali e verranno utilizzate solo per scopi fiscali e di fatturazione.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>I Tuoi Dati</CardTitle>
          <CardDescription>
            Assicurati che i dati siano corretti per evitare problemi con pagamenti e fatture.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="company_name">Nome Azienda / Ditta Individuale</Label>
                <Input
                  id="company_name"
                  name="company_name"
                  defaultValue={taxDetails?.company_name ?? ""}
                  placeholder="Es. Mario Rossi"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vat_number">Partita IVA</Label>
                <Input
                  id="vat_number"
                  name="vat_number"
                  defaultValue={taxDetails?.vat_number ?? ""}
                  placeholder="IT12345678901"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tax_id">Codice Fiscale</Label>
              <Input id="tax_id" name="tax_id" defaultValue={taxDetails?.tax_id ?? ""} placeholder="RSSMRA80A01H501U" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Indirizzo di Residenza / Sede Legale</Label>
              <Input id="address" name="address" defaultValue={taxDetails?.address ?? ""} placeholder="Via Roma, 1" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="city">Città</Label>
                <Input id="city" name="city" defaultValue={taxDetails?.city ?? ""} placeholder="Milano" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zip_code">CAP</Label>
                <Input id="zip_code" name="zip_code" defaultValue={taxDetails?.zip_code ?? ""} placeholder="20121" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Paese</Label>
                <Input id="country" name="country" defaultValue={taxDetails?.country ?? "Italia"} />
              </div>
            </div>
            <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salva Dati Fiscali
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
