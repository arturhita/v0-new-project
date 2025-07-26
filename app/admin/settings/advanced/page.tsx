"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Save, AlertTriangle, Smartphone, Phone, MessageCircle, CheckCircle, XCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

type CommissionRequest = {
  id: string
  operatorId: string
  operatorName: string
  currentCommission: number
  requestedCommission: number
  reason: string
  date: string
  status: "pending" | "approved" | "rejected"
}

const initialRequests: CommissionRequest[] = [
  {
    id: "req1",
    operatorId: "op1",
    operatorName: "Stella Divina",
    currentCommission: 70,
    requestedCommission: 75,
    reason: "Aumento performance e recensioni positive",
    date: "2024-01-15",
    status: "pending",
  },
  {
    id: "req2",
    operatorId: "op2",
    operatorName: "Marco Astrologo",
    currentCommission: 65,
    requestedCommission: 70,
    reason: "Esperienza pluriennale e clienti fidelizzati",
    date: "2024-01-12",
    status: "pending",
  },
]

export default function AdvancedSettingsPage() {
  const { toast } = useToast()
  const [settings, setSettings] = useState({
    callDeductions: {
      enabled: true,
      userFixedDeduction: 0.5,
      operatorFixedDeduction: 0.3,
    },
    paymentProcessing: {
      operatorFixedFee: 0.25,
      enabled: true,
    },
    operatorDeductions: {
      enabled: true,
      fixedDeduction: 1.0,
    },
    commissionRequests: {
      autoApprove: false,
      maxIncrease: 5,
      requiresApproval: true,
      notificationEmail: "admin@unveilly.com",
    },
  })

  const [requests, setRequests] = useState<CommissionRequest[]>(initialRequests)

  const handleSaveSettings = () => {
    toast({
      title: "Impostazioni salvate",
      description: "Le impostazioni avanzate sono state aggiornate con successo.",
    })
  }

  const handleApproveRequest = (requestId: string) => {
    setRequests((prev) => prev.filter((req) => req.id !== requestId))
    toast({
      title: "Richiesta Approvata",
      description: "L'aumento della percentuale è stato approvato.",
      action: <CheckCircle className="text-green-600" />,
    })
  }

  const handleRejectRequest = (requestId: string) => {
    setRequests((prev) => prev.filter((req) => req.id !== requestId))
    toast({
      title: "Richiesta Rifiutata",
      description: "L'aumento della percentuale è stato rifiutato.",
      variant: "destructive",
      action: <XCircle className="text-white" />,
    })
  }

  const pendingRequests = requests.filter((r) => r.status === "pending")

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-800">Impostazioni Avanzate</h1>
        <p className="text-slate-600">
          Configura detrazioni fisse, commissioni e gestisci le richieste degli operatori.
        </p>
      </div>

      {/* Detrazioni Chiamate (Prezzo Fisso) */}
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
              checked={settings.callDeductions.enabled}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({
                  ...prev,
                  callDeductions: { ...prev.callDeductions, enabled: checked },
                }))
              }
            />
          </div>

          {settings.callDeductions.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="user-fixed-deduction" className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Detrazione Utente (€)
                </Label>
                <Input
                  id="user-fixed-deduction"
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={settings.callDeductions.userFixedDeduction}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      callDeductions: {
                        ...prev.callDeductions,
                        userFixedDeduction: Number(e.target.value),
                      },
                    }))
                  }
                />
                <p className="text-sm text-slate-500">
                  Importo fisso detratto dal costo per l'utente per ogni chiamata
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="operator-fixed-deduction" className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  Detrazione Operatore (€)
                </Label>
                <Input
                  id="operator-fixed-deduction"
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={settings.callDeductions.operatorFixedDeduction}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      callDeductions: {
                        ...prev.callDeductions,
                        operatorFixedDeduction: Number(e.target.value),
                      },
                    }))
                  }
                />
                <p className="text-sm text-slate-500">
                  Importo fisso detratto dal guadagno operatore per ogni chiamata
                </p>
              </div>
            </div>
          )}

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Nota:</strong> Queste detrazioni si applicano solo alle chiamate telefoniche, non alle chat
              testuali.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Richieste Aumento Percentuali */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-sky-600" />
            Richieste Aumento Percentuali
            <Badge variant="secondary">{pendingRequests.length} in attesa</Badge>
          </CardTitle>
          <CardDescription>Gestisci le richieste di aumento delle percentuali degli operatori</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <h4 className="font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Richieste in Attesa
            </h4>

            {pendingRequests.length > 0 ? (
              pendingRequests.map((request) => (
                <Card key={request.id} className="border-l-4 border-l-amber-500">
                  <CardContent className="pt-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="space-y-1 flex-1">
                        <p className="font-medium">{request.operatorName}</p>
                        <p className="text-sm text-slate-600">
                          {request.currentCommission}% → {request.requestedCommission}%
                          <span className="text-green-600 font-medium ml-2">
                            (+{request.requestedCommission - request.currentCommission}%)
                          </span>
                        </p>
                        <p className="text-sm text-slate-500 italic">"{request.reason}"</p>
                        <p className="text-xs text-slate-400">Richiesta del {request.date}</p>
                      </div>

                      <div className="flex gap-2 flex-shrink-0">
                        <Button
                          size="sm"
                          onClick={() => handleApproveRequest(request.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approva
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleRejectRequest(request.id)}>
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
          </div>
        </CardContent>
      </Card>

      {/* Salva Impostazioni */}
      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} className="bg-sky-600 hover:bg-sky-700">
          <Save className="h-4 w-4 mr-2" />
          Salva Impostazioni
        </Button>
      </div>
    </div>
  )
}
