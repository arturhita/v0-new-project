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
  const [taxDetails, setTaxDetails] = useState<Partial<OperatorTaxDetails>>({})
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
          .then((data) => setTaxDetails(data || {}))
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

  if (loading) return <Loader2 className="mx-auto mt-8 h-8 w-8 animate-spin text-primary" />

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white">Dati Fiscali</h1>
      <Card className="bg-gray-800 border-gray-700 text-white">
        <CardHeader>
          <CardTitle>I Tuoi Dati</CardTitle>
          <CardDescription className="text-gray-400">
            Assicurati che i dati siano corretti per fatture e pagamenti.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="company_name">Nome Azienda / Ditta</Label>
                <Input
                  id="company_name"
                  name="company_name"
                  defaultValue={taxDetails.company_name ?? ""}
                  className="bg-gray-900 border-gray-600"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vat_number">Partita IVA</Label>
                <Input
                  id="vat_number"
                  name="vat_number"
                  defaultValue={taxDetails.vat_number ?? ""}
                  className="bg-gray-900 border-gray-600"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tax_id">Codice Fiscale</Label>
              <Input
                id="tax_id"
                name="tax_id"
                defaultValue={taxDetails.tax_id ?? ""}
                className="bg-gray-900 border-gray-600"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Indirizzo Sede Legale</Label>
              <Input
                id="address"
                name="address"
                defaultValue={taxDetails.address ?? ""}
                className="bg-gray-900 border-gray-600"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="city">Città</Label>
                <Input
                  id="city"
                  name="city"
                  defaultValue={taxDetails.city ?? ""}
                  className="bg-gray-900 border-gray-600"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zip_code">CAP</Label>
                <Input
                  id="zip_code"
                  name="zip_code"
                  defaultValue={taxDetails.zip_code ?? ""}
                  className="bg-gray-900 border-gray-600"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Paese</Label>
                <Input
                  id="country"
                  name="country"
                  defaultValue={taxDetails.country ?? "Italia"}
                  className="bg-gray-900 border-gray-600"
                />
              </div>
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Salva Dati
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
