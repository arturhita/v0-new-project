"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Save, Phone, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { type PlatformSettings, savePlatformSettings, resolveCommissionRequest } from "@/lib/actions/settings.actions"

type CommissionRequest = {
  id: string
  operator_id: string
  operatorName: string
  current_commission: number
  requested_commission: number
  justification: string
  created_at: string
}

interface AdvancedSettingsClientProps {
  initialSettings: PlatformSettings
  initialRequests: CommissionRequest[]
}

export function AdvancedSettingsClient({ initialSettings, initialRequests }: AdvancedSettingsClientProps) {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [settings, setSettings] = useState(initialSettings)
  const [requests, setRequests] = useState(initialRequests)

  const handleSaveSettings = () => {
    startTransition(async () => {
      const result = await savePlatformSettings(settings)
      toast({
        title: result.success ? "Impostazioni salvate" : "Errore",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      })
    })
  }

  const handleResolveRequest = (requestId: string, approved: boolean) => {
    startTransition(async () => {
      // L'ID dell'admin andrebbe preso dalla sessione utente
      const adminUserId = "f2e5c6d8-4a7b-4c3d-9e1f-8a7b6c5d4e3f" // Placeholder
      const result = await resolveCommissionRequest(requestId, approved, adminUserId)

      toast({
        title: result.success ? "Richiesta gestita" : "Errore",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      })

      if (result.success) {
        setRequests((prev) => prev.filter((req) => req.id !== requestId))
      }
    })
  }

  return (
    <>
      {/* Detrazioni Chiamate */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-sky-600" />
            Detrazioni Chiamate (Prezzo Fisso)
          </CardTitle>
          <CardDescription>Configura le detrazioni fisse in euro per le chiamate telefoniche</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="call-deductions">Abilita detrazioni chiamate</Label>
            <Switch
              id="call-deductions"
              checked={settings.call_deductions.enabled}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({
                  ...prev,
                  call_deductions: { ...prev.call_deductions, enabled: checked },
                }))
              }
            />
          </div>

          {settings.call_deductions.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="user-fixed-deduction">Detrazione Utente (€)</Label>
                <Input
                  id="user-fixed-deduction"
                  type="number"
                  step="0.01"
                  value={settings.call_deductions.user_fixed_deduction}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      call_deductions: { ...prev.call_deductions, user_fixed_deduction: Number(e.target.value) },
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="operator-fixed-deduction">Detrazione Operatore (€)</Label>
                <Input
                  id="operator-fixed-deduction"
                  type="number"
                  step="0.01"
                  value={settings.call_deductions.operator_fixed_deduction}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      call_deductions: { ...prev.call_deductions, operator_fixed_deduction: Number(e.target.value) },
                    }))
                  }
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Richieste Aumento Percentuali */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-sky-600" />
            Richieste Aumento Percentuali
            <Badge variant="secondary">{requests.length} in attesa</Badge>
          </CardTitle>
          <CardDescription>Gestisci le richieste di aumento delle percentuali degli operatori</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {requests.length > 0 ? (
            requests.map((request) => (
              <Card key={request.id} className="border-l-4 border-l-amber-500">
                <CardContent className="pt-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <p className="font-medium">{request.operatorName}</p>
                      <p className="text-sm text-slate-600">
                        {request.current_commission}% → {request.requested_commission}%
                        <span className="text-green-600 font-medium ml-2">
                          (+{Number(request.requested_commission) - Number(request.current_commission)}%)
                        </span>
                      </p>
                      <p className="text-sm text-slate-500 italic">"{request.justification}"</p>
                      <p className="text-xs text-slate-400">
                        Richiesta del {new Date(request.created_at).toLocaleDateString("it-IT")}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        size="sm"
                        onClick={() => handleResolveRequest(request.id, true)}
                        className="bg-green-600 hover:bg-green-700"
                        disabled={isPending}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approva
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleResolveRequest(request.id, false)}
                        disabled={isPending}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Rifiuta
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-sm text-slate-500 text-center py-4">Nessuna richiesta in attesa.</p>
          )}
        </CardContent>
      </Card>

      {/* Salva Impostazioni */}
      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} disabled={isPending} className="bg-sky-600 hover:bg-sky-700">
          {isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Salva Impostazioni
        </Button>
      </div>
    </>
  )
}
