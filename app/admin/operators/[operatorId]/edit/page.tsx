"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { getOperatorById, updateOperatorByAdmin } from "@/lib/actions/operator.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import type { DetailedOperatorProfile } from "@/types/database"

export default function EditOperatorPage({ params }: { params: { operatorId: string } }) {
  const [operator, setOperator] = useState<DetailedOperatorProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState<Partial<DetailedOperatorProfile>>({})

  useEffect(() => {
    const fetchOperator = async () => {
      setLoading(true)
      const op = await getOperatorById(params.operatorId)
      setOperator(op)
      setFormData(op || {})
      setLoading(false)
    }
    fetchOperator()
  }, [params.operatorId])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!operator) return

    const result = await updateOperatorByAdmin(operator.id, formData)
    if (result.success) {
      toast.success(result.message)
    } else {
      toast.error(result.message)
    }
  }

  if (loading) {
    return <div>Caricamento dati operatore...</div>
  }

  if (!operator) {
    return <div>Operatore non trovato.</div>
  }

  return (
    <div className="p-4 md:p-6">
      <Link href="/admin/operators" className="flex items-center gap-2 text-sm mb-4 hover:underline">
        <ArrowLeft size={16} />
        Torna a tutti gli operatori
      </Link>
      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Modifica Operatore: {operator.full_name}</CardTitle>
              <CardDescription>Aggiorna i dettagli del profilo e lo stato dell'operatore.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Nome Completo</Label>
                  <Input
                    id="full_name"
                    name="full_name"
                    value={formData.full_name || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stage_name">Nome d'Arte</Label>
                  <Input
                    id="stage_name"
                    name="stage_name"
                    value={formData.stage_name || ""}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" value={formData.email || ""} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" name="bio" value={formData.bio || ""} onChange={handleInputChange} rows={5} />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="application_status">Stato Applicazione</Label>
                  <Select
                    name="application_status"
                    value={formData.application_status}
                    onValueChange={(value) => handleSelectChange("application_status", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona stato" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">In attesa</SelectItem>
                      <SelectItem value="approved">Approvato</SelectItem>
                      <SelectItem value="rejected">Rifiutato</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="commission_rate">Commissione (%)</Label>
                  <Input
                    id="commission_rate"
                    name="commission_rate"
                    type="number"
                    step="0.1"
                    value={formData.commission_rate || 0}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <Button type="submit">Salva Modifiche</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dati Fiscali (Solo Lettura)</CardTitle>
              <CardDescription>
                Questi dati sono gestiti dall'operatore e visibili solo all'amministrazione.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium">Codice Fiscale</p>
                  <p className="text-gray-600">{operator.fiscal_code || "Non fornito"}</p>
                </div>
                <div>
                  <p className="font-medium">Partita IVA</p>
                  <p className="text-gray-600">{operator.vat_number || "Non fornito"}</p>
                </div>
              </div>
              <div>
                <p className="font-medium">Indirizzo di Fatturazione</p>
                <p className="text-gray-600">
                  {operator.billing_address || ""}, {operator.billing_zip || ""} {operator.billing_city || ""},{" "}
                  {operator.billing_country || "Non fornito"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  )
}
