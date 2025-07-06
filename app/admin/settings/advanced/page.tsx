"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Save, Smartphone, Phone, MessageCircle, CheckCircle, XCircle } from "lucide-react"
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
    <div className="space-y-6 text-slate-200">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300">
          Impostazioni Avanzate
        </h1>
        <p className="text-slate-400 mt-1">
          Configura detrazioni, commissioni e gestisci le richieste degli operatori.
        </p>
      </div>

      {/* Richieste Aumento Percentuali */}
      <Card className="bg-slate-800/50 border-indigo-500/20 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-indigo-300">
            <TrendingUp className="h-5 w-5" />
            Richieste Aumento Percentuali
            <Badge variant="secondary" className="bg-purple-500/80 text-white border-0">
              {pendingRequests.length} in attesa
            </Badge>
          </CardTitle>
          <CardDescription className="text-slate-400">
            Gestisci le richieste di aumento delle percentuali degli operatori
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {pendingRequests.length > 0 ? (
            pendingRequests.map((request) => (
              <Card key={request.id} className="bg-slate-900/60 border-slate-700">
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <p className="font-medium text-slate-100">{request.operatorName}</p>
                      <p className="text-sm text-slate-300">
                        {request.currentCommission}% → {request.requestedCommission}%
                        <span className="text-green-400 font-medium ml-2">
                          (+{request.requestedCommission - request.currentCommission}%)
                        </span>
                      </p>
                      <p className="text-sm text-slate-400 italic">"{request.reason}"</p>
                      <p className="text-xs text-slate-500">Richiesta del {request.date}</p>
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
            <p className="text-sm text-slate-400 text-center py-4">Nessuna richiesta in attesa.</p>
          )}
        </CardContent>
      </Card>

      {/* Detrazioni Chiamate (Prezzo Fisso) */}
      <Card className="bg-slate-800/50 border-indigo-500/20 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-indigo-300">
            <Phone className="h-5 w-5" />
            Detrazioni Chiamate (Prezzo Fisso)
          </CardTitle>
          <CardDescription className="text-slate-400">
            Configura le detrazioni fisse in euro per le chiamate telefoniche
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-900/60 rounded-lg">
            <Label htmlFor="call-deductions" className="text-slate-300">
              Abilita detrazioni chiamate
            </Label>
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
                <Label htmlFor="user-fixed-deduction" className="flex items-center gap-2 text-slate-300">
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
                  className="bg-slate-700 border-slate-600 text-white"
                />
                <p className="text-sm text-slate-500">
                  Importo fisso detratto dal costo per l'utente per ogni chiamata
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="operator-fixed-deduction" className="flex items-center gap-2 text-slate-300">
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
                  className="bg-slate-700 border-slate-600 text-white"
                />
                <p className="text-sm text-slate-500">
                  Importo fisso detratto dal guadagno operatore per ogni chiamata
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Salva Impostazioni */}
      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} className="bg-indigo-600 hover:bg-indigo-700 text-white">
          <Save className="h-4 w-4 mr-2" />
          Salva Impostazioni
        </Button>
      </div>
    </div>
  )
}
