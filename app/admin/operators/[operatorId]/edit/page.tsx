"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { getOperatorById, updateOperator, updateOperatorCommission, type Operator } from "@/lib/mock-data"
import { notFound } from "next/navigation"

export default async function EditOperatorPage({ params }: { params: { operatorId: string } }) {
  const operator = await getOperatorById(params.operatorId)
  const router = useRouter()

  if (!operator) {
    notFound()
  }

  const [operatorData, setOperatorData] = useState<Operator>({
    ...operator,
    commissionRate: operator.commissionRate || 0,
    specialties: operator.specialties || [],
  })

  const handleInputChange = (field: keyof Operator, value: string | number | boolean) => {
    setOperatorData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSaveOperator = async () => {
    setIsSaving(true)
    try {
      // Simula salvataggio
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Aggiorna l'operatore nel storage condiviso
      const success = updateOperator(params.operatorId, operatorData)

      if (success) {
        toast({
          title: "Operatore aggiornato",
          description: "I dati dell'operatore sono stati salvati con successo.",
        })

        // Torna alla lista operatori
        router.push("/admin/operators")
      } else {
        throw new Error("Errore nel salvataggio")
      }
    } catch (error) {
      toast({
        title: "Errore",
        description: "Errore nel salvataggio dei dati.",
        variant: "destructive",
      })
    }
    setIsSaving(false)
  }

  const handleUpdateCommission = async () => {
    setIsSaving(true)
    try {
      // Simula aggiornamento commissione
      await new Promise((resolve) => setTimeout(resolve, 800))

      // Aggiorna la commissione nel storage condiviso
      const success = updateOperatorCommission(params.operatorId, operatorData.commissionRate)

      if (success) {
        toast({
          title: "Commissione aggiornata",
          description: `Commissione aggiornata a ${operatorData.commissionRate}%`,
        })
      } else {
        throw new Error("Errore nell'aggiornamento")
      }
    } catch (error) {
      toast({
        title: "Errore",
        description: "Errore nell'aggiornamento della commissione.",
        variant: "destructive",
      })
    }
    setIsSaving(false)
  }

  const [isSaving, setIsSaving] = useState(false)

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Modifica Operatore</CardTitle>
          <CardDescription>
            Modifica i dettagli per <span className="font-semibold">{operator.stageName}</span>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSaveOperator}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="stageName">Nome d'Arte</Label>
                <Input
                  id="stageName"
                  defaultValue={operator.stageName || ""}
                  onChange={(e) => handleInputChange("stageName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fullName">Nome Completo</Label>
                <Input
                  id="fullName"
                  defaultValue={operator.fullName || ""}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue={operator.email || ""} readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Biografia</Label>
              <Textarea
                id="bio"
                defaultValue={operator.bio || ""}
                rows={5}
                onChange={(e) => handleInputChange("bio", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="specialties">Specializzazioni (separate da virgola)</Label>
                <Input
                  id="specialties"
                  defaultValue={operator.specialties?.join(", ") || ""}
                  onChange={(e) => handleInputChange("specialties", e.target.value.split(", ").filter(Boolean))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="commissionRate">Commissione (%)</Label>
                <Input
                  id="commissionRate"
                  type="number"
                  defaultValue={operator.commissionRate || 0}
                  onChange={(e) => handleInputChange("commissionRate", Number(e.target.value))}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Salvataggio..." : "Salva Modifiche"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
