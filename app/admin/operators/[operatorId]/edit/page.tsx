"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Save, ArrowLeft, User, DollarSign, Settings } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { updateOperator, updateOperatorCommission, type Operator } from "@/lib/mock-data"
import { getOperatorById } from "@/lib/actions/operator.actions"
import { notFound } from "next/navigation"

export default async function EditOperatorPage({ params }: { params: { operatorId: string } }) {
  const operator = await getOperatorById(params.operatorId)
  if (!operator) {
    notFound()
  }

  const [commissionValue, setCommissionValue] = useState<number>(0)
  const [isSaving, setIsSaving] = useState(false)
  const [operatorData, setOperatorData] = useState(operator)
  const router = useRouter()

  const handleSaveOperator = async () => {
    setIsSaving(true)
    try {
      // Simula salvataggio
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Aggiorna l'operatore nel storage condiviso
      const success = updateOperator(operatorData.id, {
        name: operatorData.name,
        email: operatorData.email,
        phone: operatorData.phone,
        discipline: operatorData.discipline,
        description: operatorData.description,
        isActive: operatorData.isActive,
        status: operatorData.status,
      })

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
      const success = updateOperatorCommission(operatorData.id, commissionValue)

      if (success) {
        toast({
          title: "Commissione aggiornata",
          description: `Commissione aggiornata a ${commissionValue}%`,
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

  const handleInputChange = (field: keyof Operator, value: string | number | boolean) => {
    setOperatorData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => router.push("/admin/operators")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Indietro
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">Modifica Operatore</h1>
          <p className="text-slate-600">Gestisci i dati e le impostazioni dell'operatore.</p>
        </div>
      </div>

      {/* Informazioni Generali */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-sky-600" />
            Informazioni Generali
          </CardTitle>
          <CardDescription>Dati personali e di contatto dell'operatore</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input id="name" value={operatorData.name} onChange={(e) => handleInputChange("name", e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={operatorData.email || ""}
                onChange={(e) => handleInputChange("email", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefono</Label>
              <Input
                id="phone"
                value={operatorData.phone || ""}
                onChange={(e) => handleInputChange("phone", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="discipline">Specializzazione</Label>
              <Input
                id="discipline"
                value={operatorData.discipline}
                onChange={(e) => handleInputChange("discipline", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrizione</Label>
            <Textarea
              id="description"
              value={operatorData.description || ""}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={4}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="isActive">Operatore Attivo</Label>
              <p className="text-sm text-slate-500">L'operatore può ricevere consulenze</p>
            </div>
            <Switch
              id="isActive"
              checked={operatorData.isActive || false}
              onCheckedChange={(checked) => handleInputChange("isActive", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Commissioni */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-sky-600" />
            Gestione Commissioni
          </CardTitle>
          <CardDescription>Configura la percentuale di commissione dell'operatore</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="commission">Percentuale Commissione (%)</Label>
              <Input
                id="commission"
                type="number"
                min="0"
                max="100"
                value={commissionValue}
                onChange={(e) => setCommissionValue(Number(e.target.value))}
              />
              <p className="text-sm text-slate-500">Percentuale che l'operatore riceve per ogni consulenza</p>
            </div>

            <div className="space-y-2">
              <Label>Stato Commissione</Label>
              <div className="flex items-center gap-2">
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Attiva
                </Badge>
                <span className="text-sm text-slate-600">Commissione attuale: {operatorData.commission}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleUpdateCommission} disabled={isSaving} className="bg-sky-600 hover:bg-sky-700">
              <DollarSign className="h-4 w-4 mr-2" />
              {isSaving ? "Aggiornamento..." : "Aggiorna Commissione"}
            </Button>
          </div>

          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
            <h4 className="font-medium text-amber-900 mb-2">💡 Calcolo Commissioni</h4>
            <p className="text-sm text-amber-800">
              <strong>Esempio:</strong> Con commissione del {commissionValue}%, se un cliente paga €10 per una
              consulenza, l'operatore riceverà €{((10 * commissionValue) / 100).toFixed(2)} e la piattaforma €
              {(10 - (10 * commissionValue) / 100).toFixed(2)}.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Impostazioni */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-sky-600" />
            Impostazioni Account
          </CardTitle>
          <CardDescription>Stato e configurazioni dell'account operatore</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Stato Account</Label>
              <Badge
                variant={operatorData.status === "Attivo" ? "default" : "secondary"}
                className={
                  operatorData.status === "Attivo"
                    ? "bg-green-100 text-green-800"
                    : operatorData.status === "In Attesa"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                }
              >
                {operatorData.status}
              </Badge>
            </div>

            <div className="space-y-2">
              <Label>ID Operatore</Label>
              <p className="text-sm font-mono bg-slate-100 p-2 rounded">{operatorData.id}</p>
            </div>

            <div className="space-y-2">
              <Label>Data Registrazione</Label>
              <p className="text-sm text-slate-600">{operatorData.joined}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Salva Tutto */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => router.push("/admin/operators")}>
          Annulla
        </Button>
        <Button onClick={handleSaveOperator} disabled={isSaving} className="bg-sky-600 hover:bg-sky-700">
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Salvataggio..." : "Salva Tutto"}
        </Button>
      </div>
    </div>
  )
}
