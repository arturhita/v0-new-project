"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { getOperatorTaxDetails, saveOperatorTaxDetails } from "@/lib/actions/operator.actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, ShieldCheck } from "lucide-react"
import type { OperatorTaxDetails } from "@/types/database.types"

export default function TaxInfoPage() {
  const { profile } = useAuth()
  const { toast } = useToast()
  const [details, setDetails] = useState<Partial<OperatorTaxDetails>>({})
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (profile?.id) {
      getOperatorTaxDetails(profile.id)
        .then((data) => {
          if (data) setDetails(data)
        })
        .finally(() => setLoading(false))
    }
  }, [profile])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!profile) return

    setIsSubmitting(true)
    const formData = new FormData(event.currentTarget)
    const result = await saveOperatorTaxDetails(profile.id, formData)

    if (result.success) {
      toast({ title: "Successo", description: result.message })
    } else {
      toast({ title: "Errore", description: result.message, variant: "destructive" })
    }
    setIsSubmitting(false)
  }

  if (loading) {
    return <Loader2 className="mx-auto mt-8 h-8 w-8 animate-spin" />
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dati Fiscali e di Fatturazione</h1>
      <p className="text-gray-400">
        Queste informazioni sono private, verranno usate solo per la fatturazione e non saranno mostrate pubblicamente.
      </p>

      <Card className="bg-gray-800/50 border-gray-700/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="text-green-400" />
            Informazioni Protette
          </CardTitle>
          <CardDescription>Compila i campi richiesti per la corretta gestione amministrativa.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="company_name">Ragione Sociale (se applicabile)</Label>
                <Input
                  id="company_name"
                  name="company_name"
                  defaultValue={details.company_name ?? ""}
                  placeholder="Es. Consulente S.R.L."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vat_id">Partita IVA</Label>
                <Input id="vat_id" name="vat_id" defaultValue={details.vat_id ?? ""} placeholder="IT12345678901" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="tax_id">Codice Fiscale</Label>
                <Input id="tax_id" name="tax_id" defaultValue={details.tax_id ?? ""} placeholder="RSSMRA80A01H501U" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="full_address">Indirizzo di Fatturazione Completo</Label>
                <Input
                  id="full_address"
                  name="full_address"
                  defaultValue={details.full_address ?? ""}
                  placeholder="Via, Numero, CAP, Città, Provincia"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="pec_email">Email PEC</Label>
                <Input
                  id="pec_email"
                  name="pec_email"
                  type="email"
                  defaultValue={details.pec_email ?? ""}
                  placeholder="tua.email@pec.it"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sdi_code">Codice SDI</Label>
                <Input id="sdi_code" name="sdi_code" defaultValue={details.sdi_code ?? ""} placeholder="ES. XXXXXXX" />
              </div>
            </div>

            <div className="pt-4">
              <Button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salva Dati Fiscali
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
