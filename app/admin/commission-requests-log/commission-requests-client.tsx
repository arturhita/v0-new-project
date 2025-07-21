"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import { updateCommissionRequestStatus } from "@/lib/actions/commission.actions"
import { useToast } from "@/hooks/use-toast"

type CommissionRequest = {
  id: string
  operator_id: string
  current_commission_rate: number
  requested_commission_rate: number
  justification: string
  created_at: string
  status: "pending" | "approved" | "rejected"
  profile: {
    stage_name: string
  } | null
}

export function CommissionRequestsClient({ initialRequests }: { initialRequests: CommissionRequest[] }) {
  const [requests, setRequests] = useState(initialRequests)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const { toast } = useToast()

  const handleRequestAction = async (request: CommissionRequest, newStatus: "approved" | "rejected") => {
    setLoadingId(request.id)
    const result = await updateCommissionRequestStatus(
      request.id,
      request.operator_id,
      newStatus,
      request.requested_commission_rate,
    )
    setLoadingId(null)

    if (result.success) {
      setRequests((prev) => prev.map((req) => (req.id === request.id ? { ...req, status: newStatus } : req)))
      toast({
        title: "Successo",
        description: result.message,
      })
    } else {
      toast({
        title: "Errore",
        description: result.message,
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="border-yellow-500 text-yellow-600">
            In Attesa
          </Badge>
        )
      case "approved":
        return (
          <Badge variant="default" className="bg-emerald-500 text-white">
            Approvata
          </Badge>
        )
      case "rejected":
        return <Badge variant="destructive">Rifiutata</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <>
      {requests.length === 0 ? (
        <p className="text-center text-slate-500 py-4">Nessuna richiesta di modifica commissione presente.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Operatore</TableHead>
              <TableHead className="text-center">Comm. Attuale</TableHead>
              <TableHead className="text-center">Comm. Richiesta</TableHead>
              <TableHead>Data Richiesta</TableHead>
              <TableHead>Stato</TableHead>
              <TableHead className="text-right">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((req) => (
              <TableRow key={req.id}>
                <TableCell className="font-medium">
                  {req.profile?.stage_name || "N/A"}
                  <p className="text-xs text-slate-500 truncate max-w-xs mt-1" title={req.justification}>
                    Motivazione: {req.justification}
                  </p>
                </TableCell>
                <TableCell className="text-center">{req.current_commission_rate}%</TableCell>
                <TableCell className="text-center font-semibold text-[hsl(var(--primary-dark))]">
                  {req.requested_commission_rate}%
                </TableCell>
                <TableCell>{new Date(req.created_at).toLocaleDateString("it-IT")}</TableCell>
                <TableCell>{getStatusBadge(req.status)}</TableCell>
                <TableCell className="text-right">
                  {req.status === "pending" && (
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        onClick={() => handleRequestAction(req, "approved")}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white"
                        disabled={loadingId === req.id}
                      >
                        {loadingId === req.id ? (
                          <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle className="mr-1.5 h-4 w-4" />
                        )}
                        Approva
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRequestAction(req, "rejected")}
                        disabled={loadingId === req.id}
                      >
                        {loadingId === req.id ? (
                          <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                        ) : (
                          <XCircle className="mr-1.5 h-4 w-4" />
                        )}
                        Rifiuta
                      </Button>
                    </div>
                  )}
                  {req.status !== "pending" && <span className="text-xs text-slate-400">Gestita</span>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </>
  )
}
