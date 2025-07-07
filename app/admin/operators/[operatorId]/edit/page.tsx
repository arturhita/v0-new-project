"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Save, ArrowLeft, User, DollarSign, Settings } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { getOperatorById, updateOperator, updateOperatorCommission, type Operator } from "@/lib/mock-data"

export default function EditOperatorPage() {
  const params = useParams()
  const router = useRouter()
  const operatorId = params.operatorId as string

  const [operator, setOperator] = useState<Operator | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [commissionValue, setCommissionValue] = useState<number>(0)

  useEffect(() => {
    // Carica dati operatore
    setIsLoading(true)
    setTimeout(() => {
      const foundOperator = getOperatorById(operatorId)
      if (foundOperator) {
        setOperator(foundOperator)
        // Estrai il valore numerico dalla commissione (es: "15%" -> 15)
        const commissionNum = Number.parseInt(foundOperator.commission.replace("%", "")) || 0
        setCommissionValue(commissionNum)
      }
      setIsLoading(false)
    }, 500)
  }, [operatorId])

  const handleSaveOperator = async () => {
    if (!operator) return

    setIsSaving(true)
    try {
      // Simula salvataggio
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Aggiorna l'operatore nel storage condiviso
      const success = updateOperator(operatorId, {
        name: operator.name,
        email: operator.email,
        phone: operator.phone,
        discipline: operator.discipline,
        description: operator.description,
        isActive: operator.isActive,
        status: operator.status,
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
    if (!operator) return

    setIsSaving(true)
    try {
      // Simula aggiornamento commissione
      await new Promise((resolve) => setTimeout(resolve, 800))

      // Aggiorna la commissione nel storage condiviso
      const success = updateOperatorCommission(operatorId, commissionValue)

      if (success) {
        // Aggiorna lo stato locale
        setOperator((prev) => (prev ? { ...prev, commission: `${commissionValue}%` } : null))

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
    if (!operator) return
    setOperator((prev) => (prev ? { ...prev, [field]: value } : null))
  }

  if (isLoading) {
    return <div className="p-6 text-center">Caricamento operatore...</div>
  }

  if (!operator) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold text-red-600">Operatore non trovato</h2>
        <p className="text-slate-600 mt-2">L'operatore richiesto non esiste o è stato rimosso.</p>
        <Button onClick={() => router.push("/admin/operators")} className="mt-4">
          Torna alla lista
        </Button>
      </div>
    )
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
              <Input id="name" value={operator.name} onChange={(e) => handleInputChange("name", e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={operator.email || ""}
                onChange={(e) => handleInputChange("email", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefono</Label>
              <Input
                id="phone"
                value={operator.phone || ""}
                onChange={(e) => handleInputChange("phone", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="discipline">Specializzazione</Label>
              <Input
                id="discipline"
                value={operator.discipline}
                onChange={(e) => handleInputChange("discipline", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrizione</Label>
            <Textarea
              id="description"
              value={operator.description || ""}
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
              checked={operator.isActive || false}
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
                <span className="text-sm text-slate-600">Commissione attuale: {operator.commission}</span>
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
                variant={operator.status === "Attivo" ? "default" : "secondary"}
                className={
                  operator.status === "Attivo"
                    ? "bg-green-100 text-green-800"
                    : operator.status === "In Attesa"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                }
              >
                {operator.status}
              </Badge>
            </div>

            <div className="space-y-2">
              <Label>ID Operatore</Label>
              <p className="text-sm font-mono bg-slate-100 p-2 rounded">{operator.id}</p>
            </div>

            <div className="space-y-2">
              <Label>Data Registrazione</Label>
              <p className="text-sm text-slate-600">{operator.joined}</p>
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
