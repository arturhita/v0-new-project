"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, DollarSign, Download, Filter } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

type PayoutStatus = "Pending" | "Completed" | "Failed"

interface PayoutRequest {
  id: string
  operatorName: string
  amount: number
  requestDate: string
  payoutMethod: string
  status: PayoutStatus
}

const initialPayouts: PayoutRequest[] = [
  {
    id: "pay1",
    operatorName: "Stella Divina",
    amount: 1250.75,
    requestDate: "2025-07-01",
    payoutMethod: "Bonifico Bancario",
    status: "Pending",
  },
  {
    id: "pay2",
    operatorName: "Oracolo Celeste",
    amount: 875.5,
    requestDate: "2025-07-01",
    payoutMethod: "PayPal",
    status: "Pending",
  },
  {
    id: "pay3",
    operatorName: "Cosmo Intuitivo",
    amount: 2100.0,
    requestDate: "2025-06-15",
    payoutMethod: "Bonifico Bancario",
    status: "Completed",
  },
  {
    id: "pay4",
    operatorName: "Sentiero Luminoso",
    amount: 950.2,
    requestDate: "2025-06-15",
    payoutMethod: "PayPal",
    status: "Completed",
  },
  {
    id: "pay5",
    operatorName: "Eclissi Astrale",
    amount: 550.0,
    requestDate: "2025-06-10",
    payoutMethod: "Bonifico Bancario",
    status: "Failed",
  },
]

export default function PayoutsPage() {
  const [payouts, setPayouts] = useState<PayoutRequest[]>(initialPayouts)
  const [filter, setFilter] = useState<PayoutStatus | "All">("All")

  const handleMarkAsPaid = (payoutId: string) => {
    setPayouts((prev) => prev.map((p) => (p.id === payoutId ? { ...p, status: "Completed" } : p)))
    alert(`Richiesta ${payoutId} segnata come pagata (simulazione).`)
  }

  const getStatusBadge = (status: PayoutStatus) => {
    switch (status) {
      case "Pending":
        return (
          <Badge variant="outline" className="border-yellow-400/50 text-yellow-300 bg-yellow-900/30">
            <Clock className="mr-1.5 h-3 w-3" /> In Attesa
          </Badge>
        )
      case "Completed":
        return (
          <Badge variant="default" className="bg-green-600/80 text-white border-0">
            <CheckCircle className="mr-1.5 h-3 w-3" /> Completato
          </Badge>
        )
      case "Failed":
        return <Badge variant="destructive">Fallito</Badge>
      default:
        return <Badge>Sconosciuto</Badge>
    }
  }

  const filteredPayouts = payouts.filter((p) => filter === "All" || p.status === filter)
  const totalPending = payouts.reduce((sum, p) => (p.status === "Pending" ? sum + p.amount : sum), 0)

  return (
    <div className="space-y-6 text-slate-200">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300">
          Gestione Pagamenti (Payout)
        </h1>
        <p className="text-slate-400 mt-1">
          Visualizza, gestisci e processa le richieste di pagamento degli operatori.
        </p>
      </div>

      <Card className="bg-slate-800/50 border-indigo-500/20 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-indigo-300">Riepilogo Pagamenti</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="flex items-center space-x-4 rounded-md border border-slate-700 p-4">
            <DollarSign className="h-8 w-8 text-yellow-400" />
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium leading-none text-slate-300">Totale da Pagare</p>
              <p className="text-2xl font-semibold text-yellow-300">€{totalPending.toFixed(2)}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 rounded-md border border-slate-700 p-4">
            <Clock className="h-8 w-8 text-sky-400" />
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium leading-none text-slate-300">Richieste in Attesa</p>
              <p className="text-2xl font-semibold text-sky-300">
                {payouts.filter((p) => p.status === "Pending").length}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4 rounded-md border border-slate-700 p-4">
            <CheckCircle className="h-8 w-8 text-green-400" />
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium leading-none text-slate-300">Pagamenti Mese Corrente</p>
              <p className="text-2xl font-semibold text-green-300">
                {payouts.filter((p) => p.status === "Completed").length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/50 border-indigo-500/20 backdrop-blur-xl">
        <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <CardTitle className="text-indigo-300">Storico Richieste</CardTitle>
            <CardDescription className="text-slate-400 mt-1">
              Visualizza tutte le richieste di pagamento, filtrate per stato.
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="text-slate-300 border-slate-600 hover:bg-slate-700 hover:text-white bg-transparent"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Filtra: {filter}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-slate-800 border-slate-700 text-slate-200">
                <DropdownMenuItem onClick={() => setFilter("All")} className="hover:!bg-slate-700">
                  Tutti
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("Pending")} className="hover:!bg-slate-700">
                  In Attesa
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("Completed")} className="hover:!bg-slate-700">
                  Completati
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("Failed")} className="hover:!bg-slate-700">
                  Falliti
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="outline"
              className="text-slate-300 border-slate-600 hover:bg-slate-700 hover:text-white bg-transparent"
            >
              <Download className="mr-2 h-4 w-4" />
              Esporta CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700 hover:bg-transparent">
                <TableHead className="text-slate-300">Operatore</TableHead>
                <TableHead className="text-right text-slate-300">Importo</TableHead>
                <TableHead className="text-center text-slate-300">Metodo</TableHead>
                <TableHead className="text-center text-slate-300">Data Richiesta</TableHead>
                <TableHead className="text-center text-slate-300">Stato</TableHead>
                <TableHead className="text-right text-slate-300">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayouts.map((payout) => (
                <TableRow key={payout.id} className="border-slate-800">
                  <TableCell className="font-medium text-slate-100">{payout.operatorName}</TableCell>
                  <TableCell className="text-right font-mono text-slate-300">€{payout.amount.toFixed(2)}</TableCell>
                  <TableCell className="text-center text-slate-400">{payout.payoutMethod}</TableCell>
                  <TableCell className="text-center text-slate-400">
                    {new Date(payout.requestDate).toLocaleDateString("it-IT")}
                  </TableCell>
                  <TableCell className="text-center">{getStatusBadge(payout.status)}</TableCell>
                  <TableCell className="text-right">
                    {payout.status === "Pending" && (
                      <Button
                        size="sm"
                        onClick={() => handleMarkAsPaid(payout.id)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle className="mr-1.5 h-4 w-4" /> Segna come Pagato
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
