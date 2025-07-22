"use client"

import type React from "react"

import { useEffect } from "react"
import { useFormState, useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Save, User, DollarSign, Settings } from "lucide-react"
import { toast } from "sonner"
import { updateOperatorDetails, updateOperatorCommission } from "@/lib/actions/operator.actions"
import { useRouter } from "next/navigation"

type OperatorProfile = {
  id: string
  stage_name: string | null
  email: string | null
  phone: string | null
  specialties: string[] | null
  bio: string | null
  is_active: boolean | null
  status: string | null
  commission_rate: number | null
  created_at: string
}

const initialState = {
  message: "",
  error: false,
}

function SubmitButton({ children, ...props }: React.ComponentProps<typeof Button>) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} {...props}>
      {pending ? "Salvataggio..." : children}
    </Button>
  )
}

export function EditOperatorForm({ operator }: { operator: OperatorProfile }) {
  const router = useRouter()
  const [detailsState, detailsAction] = useFormState(updateOperatorDetails, initialState)
  const [commissionState, commissionAction] = useFormState(updateOperatorCommission, initialState)

  useEffect(() => {
    if (detailsState.message) {
      if (detailsState.error) {
        toast.error(detailsState.message)
      } else {
        toast.success(detailsState.message)
        // Optional: redirect on success
        // router.push('/admin/operators')
      }
    }
  }, [detailsState, router])

  useEffect(() => {
    if (commissionState.message) {
      if (commissionState.error) {
        toast.error(commissionState.message)
      } else {
        toast.success(commissionState.message)
      }
    }
  }, [commissionState])

  const commissionValue = operator.commission_rate || 0

  return (
    <>
      <form action={detailsAction}>
        <input type="hidden" name="operatorId" value={operator.id} />
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
                <Label htmlFor="name">Nome D'arte</Label>
                <Input id="name" name="name" defaultValue={operator.stage_name || ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" defaultValue={operator.email || ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefono</Label>
                <Input id="phone" name="phone" defaultValue={operator.phone || ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discipline">Specializzazione Principale</Label>
                <Input id="discipline" name="discipline" defaultValue={operator.specialties?.[0] || ""} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrizione (Bio)</Label>
              <Textarea id="description" name="description" defaultValue={operator.bio || ""} rows={4} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="isActive" className="cursor-pointer">
                  Operatore Attivo
                </Label>
                <p className="text-sm text-slate-500">L'operatore può ricevere consulenze</p>
              </div>
              <Switch id="isActive" name="isActive" defaultChecked={operator.is_active || false} />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" type="button" onClick={() => router.push("/admin/operators")}>
            Annulla
          </Button>
          <SubmitButton className="bg-sky-600 hover:bg-sky-700">
            <Save className="h-4 w-4 mr-2" />
            Salva Dati Generali
          </SubmitButton>
        </div>
      </form>

      <form action={commissionAction} className="mt-6">
        <input type="hidden" name="operatorId" value={operator.id} />
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
                  name="commission"
                  type="number"
                  min="0"
                  max="100"
                  defaultValue={commissionValue}
                />
                <p className="text-sm text-slate-500">Percentuale che l'operatore riceve per ogni consulenza</p>
              </div>
              <div className="space-y-2">
                <Label>Stato Commissione</Label>
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Attiva
                  </Badge>
                  <span className="text-sm text-slate-600">Commissione attuale: {commissionValue}%</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <SubmitButton className="bg-sky-600 hover:bg-sky-700">
                <DollarSign className="h-4 w-4 mr-2" />
                Aggiorna Commissione
              </SubmitButton>
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
      </form>

      <Card className="mt-6">
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
                    : operator.status === "In attesa"
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
              <p className="text-sm text-slate-600">{new Date(operator.created_at).toLocaleDateString("it-IT")}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
