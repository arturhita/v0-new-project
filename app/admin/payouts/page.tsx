"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, XCircle, MoreHorizontal, DollarSign } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type PayoutStatus = "Pending" | "Processing" | "Paid" | "Rejected" | "On Hold"

interface PayoutRequest {
  id: string
  operatorName: string
  operatorId: string
  amount: number
  currency: string
  requestedDate: string
  paymentMethod: "PayPal" | "IBAN"
  paypalEmail?: string
  iban?: string
  status: PayoutStatus
}

const initialPayoutRequests: PayoutRequest[] = [
  {
    id: "pay1",
    operatorName: "Stella Divina",
    operatorId: "master1",
    amount: 250.75,
    currency: "EUR",
    requestedDate: "2025-06-18",
    paymentMethod: "PayPal",
    paypalEmail: "stella.divina@paypal.example",
    status: "Pending",
  },
  {
    id: "pay2",
    operatorName: "Oracolo Celeste",
    operatorId: "master2",
    amount: 180.0,
    currency: "EUR",
    requestedDate: "2025-06-19",
    paymentMethod: "IBAN",
    iban: "IT60X0542811101000000123456",
    status: "Processing",
  },
  {
    id: "pay3",
    operatorName: "Seraphina dei Numeri",
    operatorId: "master3",
    amount: 95.5,
    currency: "EUR",
    requestedDate: "2025-06-20",
    paymentMethod: "PayPal",
    paypalEmail: "seraphina.numeris@paypal.example",
    status: "Paid",
  },
]

export default function ManagePayoutsPage() {
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>(initialPayoutRequests)

  const updatePayoutStatus = (id: string, newStatus: PayoutStatus) => {
    setPayoutRequests((prev) => prev.map((req) => (req.id === id ? { ...req, status: newStatus } : req)))
    alert(`Stato del pagamento ${id} aggiornato a ${newStatus} (simulazione).`)
  }

  const getStatusBadge = (status: PayoutStatus) => {
    switch (status) {
      case "Pending":
        return (
          <Badge variant="outline" className="border-yellow-500 text-yellow-600">
            In Attesa
          </Badge>
        )
      case "Processing":
        return (
          <Badge variant="outline" className="border-blue-500 text-blue-600">
            In Elaborazione
          </Badge>
        )
      case "Paid":
        return (
          <Badge variant="default" className="bg-emerald-500 text-white">
            Pagato
          </Badge>
        )
      case "Rejected":
        return <Badge variant="destructive">Rifiutato</Badge>
      case "On Hold":
        return <Badge variant="secondary">In Sospeso</Badge>
      default:
        return <Badge>Sconosciuto</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-slate-800">Gestione Pagamenti Operatori</h1>
      <CardDescription className="text-slate-500 -mt-4">
        Visualizza, processa e gestisci le richieste di pagamento inviate dagli operatori.
      </CardDescription>

      <Card className="shadow-xl rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl text-slate-700 flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-[hsl(var(--primary-medium))]" />
            Richieste di Payout
          </CardTitle>
        </CardHeader>
        <CardContent>
          {payoutRequests.length === 0 ? (
            <p className="text-slate-500 text-center py-4">Nessuna richiesta di pagamento al momento.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Operatore</TableHead>
                  <TableHead className="text-right">Importo</TableHead>
                  <TableHead>Data Richiesta</TableHead>
                  <TableHead>Metodo</TableHead>
                  <TableHead>Stato</TableHead>
                  <TableHead className="text-right">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payoutRequests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell className="font-medium">{req.operatorName}</TableCell>
                    <TableCell className="text-right">
                      {req.amount.toFixed(2)} {req.currency}
                    </TableCell>
                    <TableCell>{req.requestedDate}</TableCell>
                    <TableCell>
                      {req.paymentMethod}
                      {req.paymentMethod === "PayPal" && (
                        <span className="text-xs block text-slate-500">{req.paypalEmail}</span>
                      )}
                      {req.paymentMethod === "IBAN" && <span className="text-xs block text-slate-500">{req.iban}</span>}
                    </TableCell>
                    <TableCell>{getStatusBadge(req.status)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Azioni Pagamento</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Modifica Stato</DropdownMenuLabel>
                          {req.status !== "Paid" && req.status !== "Processing" && (
                            <DropdownMenuItem onClick={() => updatePayoutStatus(req.id, "Processing")}>
                              <CheckCircle className="mr-2 h-4 w-4 text-blue-500" /> Processa Pagamento
                            </DropdownMenuItem>
                          )}
                          {req.status !== "Paid" && (
                            <DropdownMenuItem onClick={() => updatePayoutStatus(req.id, "Paid")}>
                              <CheckCircle className="mr-2 h-4 w-4 text-emerald-500" /> Segna come Pagato
                            </DropdownMenuItem>
                          )}
                          {req.status !== "On Hold" && (
                            <DropdownMenuItem onClick={() => updatePayoutStatus(req.id, "On Hold")}>
                              <Clock className="mr-2 h-4 w-4 text-orange-500" /> Metti in Sospeso
                            </DropdownMenuItem>
                          )}
                          {req.status !== "Rejected" && (
                            <DropdownMenuItem
                              onClick={() => updatePayoutStatus(req.id, "Rejected")}
                              className="text-red-600"
                            >
                              <XCircle className="mr-2 h-4 w-4" /> Rifiuta Pagamento
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
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
