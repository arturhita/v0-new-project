"use client"

import { useState, useEffect, useTransition } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, ArrowLeft, User, DollarSign, Settings, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getOperatorForEdit, updateOperatorProfile, updateOperatorCommission } from "@/lib/actions/operator.actions"

type OperatorForEdit = Awaited<ReturnType<typeof getOperatorForEdit>>

export default function EditOperatorPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const operatorId = params.operatorId as string

  const [operator, setOperator] = useState<OperatorForEdit | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, startSavingTransition] = useTransition()
  const [isSavingCommission, startCommissionTransition] = useTransition()

  useEffect(() => {
    const fetchOperator = async () => {
      setIsLoading(true)
      try {
        const data = await getOperatorForEdit(operatorId)
        setOperator(data)
      } catch (error) {
        toast({
          title: "Errore",
          description: "Impossibile caricare i dati dell'operatore.",
          variant: "destructive",
        })
        setOperator(null)
      } finally {
        setIsLoading(false)
      }
    }
    if (operatorId) {
      fetchOperator()
    }
  }, [operatorId, toast])

  const handleSaveProfile = async () => {
    if (!operator) return

    startSavingTransition(async () => {
      const result = await updateOperatorProfile(operatorId, {
        full_name: operator.full_name,
        stage_name: operator.stage_name,
        phone: operator.phone,
        main_discipline: operator.main_discipline,
        bio: operator.bio,
        is_available: operator.is_available,
        status: operator.status,
      })

      if (result.success) {
        toast({
          title: "Profilo Aggiornato",
          description: result.message,
        })
        router.push("/admin/operators")
      } else {
        toast({
          title: "Errore",
          description: result.message,
          variant: "destructive",
        })
      }
    })
  }

  const handleUpdateCommission = async () => {
    if (!operator || operator.commission_rate === null) return

    startCommissionTransition(async () => {
      const result = await updateOperatorCommission(operatorId, operator.commission_rate!)
      if (result.success) {
        toast({
          title: "Commissione Aggiornata",
          description: result.message,
        })
      } else {
        toast({
          title: "Errore",
          description: result.message,
          variant: "destructive",
        })
      }
    })
  }

  const handleInputChange = (field: keyof OperatorForEdit, value: any) => {
    setOperator((prev) => (prev ? { ...prev, [field]: value } : null))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-sky-600" />
          <p className="text-slate-600">Caricamento dati operatore...</p>
        </div>
      </div>
    )
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

  const commissionValue = operator.commission_rate ?? 0

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => router.push("/admin/operators")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Indietro
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">Modifica Operatore</h1>
          <p className="text-slate-600">Gestisci i dati e le impostazioni di {operator.stage_name}.</p>
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
              <Label htmlFor="full_name">Nome Completo</Label>
              <Input
                id="full_name"
                value={operator.full_name || ""}
                onChange={(e) => handleInputChange("full_name", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stage_name">Nome d'Arte</Label>
              <Input
                id="stage_name"
                value={operator.stage_name || ""}
                onChange={(e) => handleInputChange("stage_name", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={operator.email || ""} disabled />
              <p className="text-xs text-slate-500">L'email non può essere modificata da qui.</p>
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
              <Label htmlFor="main_discipline">Specializzazione Principale</Label>
              <Input
                id="main_discipline"
                value={operator.main_discipline || ""}
                onChange={(e) => handleInputChange("main_discipline", e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Descrizione</Label>
            <Textarea
              id="bio"
              value={operator.bio || ""}
              onChange={(e) => handleInputChange("bio", e.target.value)}
              rows={4}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="commission">Percentuale Commissione (%)</Label>
              <Input
                id="commission"
                type="number"
                min="0"
                max="100"
                value={commissionValue}
                onChange={(e) => handleInputChange("commission_rate", Number(e.target.value))}
              />
            </div>
            <Button
              onClick={handleUpdateCommission}
              disabled={isSavingCommission}
              className="bg-sky-600 hover:bg-sky-700 w-full md:w-auto"
            >
              <DollarSign className="h-4 w-4 mr-2" />
              {isSavingCommission ? "Aggiornamento..." : "Aggiorna Commissione"}
            </Button>
          </div>
          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 mt-4">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="status">Stato Account</Label>
              <Select
                value={operator.status || "pending"}
                onValueChange={(value) => handleInputChange("status", value)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Seleziona stato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Attivo</SelectItem>
                  <SelectItem value="pending">In Attesa</SelectItem>
                  <SelectItem value="suspended">Sospeso</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between border p-3 rounded-md">
              <div>
                <Label htmlFor="is_available">Disponibile per Consulenze</Label>
                <p className="text-sm text-slate-500">L'operatore può ricevere richieste</p>
              </div>
              <Switch
                id="is_available"
                checked={operator.is_available || false}
                onCheckedChange={(checked) => handleInputChange("is_available", checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Salva Tutto */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => router.push("/admin/operators")}>
          Annulla
        </Button>
        <Button onClick={handleSaveProfile} disabled={isSaving} className="bg-sky-600 hover:bg-sky-700">
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Salvataggio..." : "Salva Modifiche Profilo"}
        </Button>
      </div>
    </div>
  )
}
