// NUOVO FILE per le richieste di commissione
"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, FileText } from "lucide-react"

type CommissionRequestStatus = "Pending" | "Approved" | "Rejected"

interface CommissionRequest {
  id: string
  operatorName: string
  operatorId: string
  currentCommission: number
  requestedCommission: number
  justification: string
  requestDate: string
  status: CommissionRequestStatus
}

const initialCommissionRequests: CommissionRequest[] = [
  {
    id: "cr1",
    operatorName: "Stella Divina",
    operatorId: "master1",
    currentCommission: 15,
    requestedCommission: 12,
    justification: "Anzianità sulla piattaforma e alto volume di consulti positivi.",
    requestDate: "2025-06-18",
    status: "Pending",
  },
  {
    id: "cr2",
    operatorName: "Oracolo Celeste",
    operatorId: "master2",
    currentCommission: 15,
    requestedCommission: 10,
    justification: "Vorrei allinearmi con le tariffe di mercato per la mia specializzazione.",
    requestDate: "2025-06-20",
    status: "Approved",
  },
]

export default function ManageCommissionRequestsPage() {
  const [requests, setRequests] = useState<CommissionRequest[]>(initialCommissionRequests)

  const handleRequestAction = (requestId: string, newStatus: "Approved" | "Rejected") => {
    setRequests((prev) => prev.map((req) => (req.id === requestId ? { ...req, status: newStatus } : req)))
    // In un'app reale, aggiorneresti la commissione dell'operatore nel DB se 'Approved'
    alert(`Richiesta commissione ${requestId} ${newStatus === "Approved" ? "approvata" : "rifiutata"} (simulazione).`)
  }

  const getStatusBadge = (status: CommissionRequestStatus) => {
    switch (status) {
      case "Pending":
        return (
          <Badge variant="outline" className="border-yellow-500 text-yellow-600">
            In Attesa
          </Badge>
        )
      case "Approved":
        return (
          <Badge variant="default" className="bg-emerald-500 text-white">
            Approvata
          </Badge>
        )
      case "Rejected":
        return <Badge variant="destructive">Rifiutata</Badge>
      default:
        return <Badge>Sconosciuto</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-slate-800">Richieste Modifica Commissione</h1>
      <CardDescription className="text-slate-500 -mt-4">
        Valuta le richieste di modifica della percentuale di commissione inviate dagli operatori.
      </CardDescription>

      <Card className="shadow-xl rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2 text-[hsl(var(--primary-medium))]" />
            Richieste Pendenti e Storico
          </CardTitle>
        </CardHeader>
        <CardContent>
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
                      {req.operatorName}
                      <p className="text-xs text-slate-500 truncate max-w-xs mt-1" title={req.justification}>
                        Motivazione: {req.justification}
                      </p>
                    </TableCell>
                    <TableCell className="text-center">{req.currentCommission}%</TableCell>
                    <TableCell className="text-center font-semibold text-[hsl(var(--primary-dark))]">
                      {req.requestedCommission}%
                    </TableCell>
                    <TableCell>{new Date(req.requestDate).toLocaleDateString("it-IT")}</TableCell>
                    <TableCell>{getStatusBadge(req.status)}</TableCell>
                    <TableCell className="text-right">
                      {req.status === "Pending" && (
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            onClick={() => handleRequestAction(req.id, "Approved")}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white"
                          >
                            <CheckCircle className="mr-1.5 h-4 w-4" /> Approva
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRequestAction(req.id, "Rejected")}
                          >
                            <XCircle className="mr-1.5 h-4 w-4" /> Rifiuta
                          </Button>
                        </div>
                      )}
                      {req.status !== "Pending" && <span className="text-xs text-slate-400">Gestita</span>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
