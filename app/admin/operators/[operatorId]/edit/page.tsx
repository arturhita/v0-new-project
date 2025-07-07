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
import { Save, ArrowLeft, User, DollarSign, Settings, ShieldCheck, Loader2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { getOperatorById, updateOperatorByAdmin, updateOperatorCommissionByAdmin } from "@/lib/actions/operator.actions"
import type { DetailedOperatorProfile } from "@/types/database"

export default function EditOperatorPage() {
  const params = useParams()
  const router = useRouter()
  const operatorId = params.operatorId as string

  const [operator, setOperator] = useState<DetailedOperatorProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (operatorId) {
      setIsLoading(true)
      getOperatorById(operatorId)
        .then((foundOperator) => {
          if (foundOperator) {
            setOperator(foundOperator)
          }
        })
        .finally(() => setIsLoading(false))
    }
  }, [operatorId])

  const handleSave = async () => {
    if (!operator) return
    setIsSaving(true)
    try {
      await updateOperatorByAdmin(operatorId, {
        full_name: operator.full_name,
        email: operator.email,
        phone: operator.phone,
        bio: operator.bio,
        is_online: operator.is_online,
      })
      await updateOperatorCommissionByAdmin(operatorId, operator.commission_rate)
      toast({
        title: "Operatore aggiornato",
        description: "I dati sono stati salvati con successo.",
      })
      router.push("/admin/operators")
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message || "Errore nel salvataggio dei dati.",
        variant: "destructive",
      })
    }
    setIsSaving(false)
  }

  const handleInputChange = (field: keyof DetailedOperatorProfile, value: any) => {
    setOperator((prev) => (prev ? { ...prev, [field]: value } : null))
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
      </div>
    )
  }

  if (!operator) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold text-red-600">Operatore non trovato</h2>
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
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                value={operator.full_name || ""}
                onChange={(e) => handleInputChange("full_name", e.target.value)}
              />
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
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descrizione</Label>
            <Textarea
              id="description"
              value={operator.bio || ""}
              onChange={(e) => handleInputChange("bio", e.target.value)}
              rows={4}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="is_online">Operatore Online</Label>
              <p className="text-sm text-slate-500">Indica se l'operatore è attualmente online.</p>
            </div>
            <Switch
              id="is_online"
              checked={operator.is_online || false}
              onCheckedChange={(checked) => handleInputChange("is_online", checked)}
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
        </CardHeader>
        <CardContent>
          <Label htmlFor="commission">Percentuale Commissione (%)</Label>
          <Input
            id="commission"
            type="number"
            min="0"
            max="100"
            value={operator.commission_rate}
            onChange={(e) => handleInputChange("commission_rate", Number(e.target.value))}
          />
        </CardContent>
      </Card>

      {/* Dati Fiscali (Solo Admin) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-sky-600" />
            Dati Fiscali (Visibili solo ad Admin)
          </CardTitle>
          <CardDescription>Informazioni di fatturazione fornite dall'operatore.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="font-medium text-slate-500">Codice Fiscale</p>
              <p className="font-semibold text-slate-800">{operator.fiscal_code || "Non fornito"}</p>
            </div>
            <div>
              <p className="font-medium text-slate-500">Partita IVA</p>
              <p className="font-semibold text-slate-800">{operator.vat_number || "N/A"}</p>
            </div>
          </div>
          <div>
            <p className="font-medium text-slate-500">Indirizzo di Fatturazione</p>
            <p className="font-semibold text-slate-800">
              {operator.billing_address
                ? `${operator.billing_address}, ${operator.billing_zip} ${operator.billing_city} (${operator.billing_country})`
                : "Non fornito"}
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
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Stato Account</Label>
            <Badge
              variant={operator.application_status === "approved" ? "default" : "secondary"}
              className={
                operator.application_status === "approved"
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }
            >
              {operator.application_status}
            </Badge>
          </div>
          <div className="space-y-2">
            <Label>ID Operatore</Label>
            <p className="text-sm font-mono bg-slate-100 p-2 rounded">{operator.id}</p>
          </div>
          <div className="space-y-2">
            <Label>Data Registrazione</Label>
            <p className="text-sm text-slate-600">{new Date(operator.created_at).toLocaleDateString()}</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => router.push("/admin/operators")}>
          Annulla
        </Button>
        <Button onClick={handleSave} disabled={isSaving} className="bg-sky-600 hover:bg-sky-700">
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          {isSaving ? "Salvataggio..." : "Salva Tutto"}
        </Button>
      </div>
    </div>
  )
}
