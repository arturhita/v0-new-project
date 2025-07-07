"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { getAdminPayoutRequests, processPayoutRequest } from "@/lib/actions/payouts.actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Check, X } from "lucide-react"
import { format } from "date-fns"
import { it } from "date-fns/locale"
import type { PayoutRequestWithDetails } from "@/types/database.types"

export default function AdminPayoutsPage() {
  const { profile } = useAuth()
  const { toast } = useToast()
  const [requests, setRequests] = useState<PayoutRequestWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)

  const fetchRequests = () => {
    setLoading(true)
    getAdminPayoutRequests()
      .then(setRequests)
      .finally(() => setLoading(false))
  }

  useEffect(fetchRequests, [])

  const handleProcess = async (requestId: string, action: "complete" | "reject") => {
    if (!profile) return
    setProcessingId(requestId)
    const result = await processPayoutRequest(requestId, profile.id, action)
    if (result.success) {
      toast({ title: "Successo", description: result.message })
      fetchRequests() // Refresh
    } else {
      toast({ title: "Errore", description: result.message, variant: "destructive" })
    }
    setProcessingId(null)
  }

  const pendingRequests = requests.filter((r) => r.status === "pending")

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Gestione Pagamenti</h1>
      <p className="text-gray-400">Visualizza e processa le richieste di pagamento degli operatori.</p>

      <Card className="bg-gray-800/50 border-gray-700/50">
        <CardHeader>
          <CardTitle>Richieste in Sospeso</CardTitle>
          <CardDescription>
            Queste richieste devono essere processate manualmente. Una volta inviato il pagamento, marcalo come
            completato.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700 hover:bg-transparent">
                <TableHead className="text-white">Data Richiesta</TableHead>
                <TableHead className="text-white">Operatore</TableHead>
                <TableHead className="text-white">Importo</TableHead>
                <TableHead className="text-white">Metodo</TableHead>
                <TableHead className="text-right text-white">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                  </TableCell>
                </TableRow>
              ) : pendingRequests.length > 0 ? (
                pendingRequests.map((req) => (
                  <TableRow key={req.id} className="border-gray-800">
                    <TableCell>{format(new Date(req.requested_at), "dd/MM/yyyy HH:mm", { locale: it })}</TableCell>
                    <TableCell>
                      <div className="font-medium">{req.operator.stage_name}</div>
                      <div className="text-xs text-gray-400">{req.operator.email}</div>
                    </TableCell>
                    <TableCell className="font-semibold">€{req.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="capitalize">{req.method.method_type}</div>
                      <div className="text-xs text-gray-400">
                        {req.method.method_type === "paypal"
                          ? req.method.details.email
                          : `${req.method.details.account_holder} - ${req.method.details.iban}`}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-500 text-red-400 hover:bg-red-500/10 hover:text-red-300 bg-transparent"
                          onClick={() => handleProcess(req.id, "reject")}
                          disabled={processingId === req.id}
                        >
                          {processingId === req.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <X className="h-4 w-4" />
                          )}
                          <span className="ml-2 hidden sm:inline">Rifiuta</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-green-500 text-green-400 hover:bg-green-500/10 hover:text-green-300 bg-transparent"
                          onClick={() => handleProcess(req.id, "complete")}
                          disabled={processingId === req.id}
                        >
                          {processingId === req.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                          <span className="ml-2 hidden sm:inline">Approva</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500">
                    Nessuna richiesta di pagamento in sospeso.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
