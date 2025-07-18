"use client"

import { useTransition } from "react"
import type { Tables } from "@/types_db"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, DollarSign, Settings, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { updateOperatorProfile, updateOperatorCommission } from "@/lib/actions/operator.actions"

type OperatorProfile = Tables<"profiles">

export function EditOperatorForm({ operator }: { operator: OperatorProfile }) {
  const { toast } = useToast()
  const [isProfileSaving, startProfileTransition] = useTransition()
  const [isCommissionSaving, startCommissionTransition] = useTransition()

  const handleProfileSubmit = async (formData: FormData) => {
    startProfileTransition(async () => {
      const result = await updateOperatorProfile(operator.id, formData)
      toast({
        title: result.success ? "Successo" : "Errore",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      })
    })
  }

  const handleCommissionSubmit = async (formData: FormData) => {
    startCommissionTransition(async () => {
      const result = await updateOperatorCommission(operator.id, formData)
      toast({
        title: result.success ? "Successo" : "Errore",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      })
    })
  }

  return (
    <>
      <form action={handleProfileSubmit}>
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
                <Input id="name" name="name" defaultValue={operator.full_name || ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stage_name">Nome d'Arte</Label>
                <Input id="stage_name" name="stage_name" defaultValue={operator.stage_name || ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email (non modificabile)</Label>
                <Input id="email" type="email" defaultValue={operator.email || ""} readOnly disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefono</Label>
                <Input id="phone" name="phone" defaultValue={operator.phone || ""} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrizione (Bio)</Label>
              <Textarea id="description" name="description" defaultValue={operator.bio || ""} rows={4} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="isActive">Operatore Visibile</Label>
                <p className="text-sm text-slate-500">Se attivo, l'operatore appare sul sito.</p>
              </div>
              <Switch id="isActive" name="isActive" defaultChecked={operator.is_active || false} />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={isProfileSaving}>
                {isProfileSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salva Informazioni
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      <form action={handleCommissionSubmit}>
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
                  name="commission"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  defaultValue={operator.commission_rate || 0}
                />
              </div>
              <Button type="submit" disabled={isCommissionSaving} className="w-full md:w-auto">
                {isCommissionSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Aggiorna Commissione
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

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
              <Select name="status" defaultValue={operator.status || "In Attesa"}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona stato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Attivo">Attivo</SelectItem>
                  <SelectItem value="In Attesa">In Attesa</SelectItem>
                  <SelectItem value="Sospeso">Sospeso</SelectItem>
                </SelectContent>
              </Select>
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
