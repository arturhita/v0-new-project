"use client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DollarSign, CalendarDays, BarChart3, AlertTriangle } from "lucide-react"

// Dati Mock per i guadagni
const dailyEarnings = 45.5
const weeklyEarnings = 280.75
const monthlyEarnings = 1250.0
const totalEarnings = 15250.6
const pendingEarnings = 150.0 // Guadagni da consulti recenti non ancora finalizzati/pagabili

const recentTransactions = [
  { id: "txn1", date: "2025-06-20", type: "Consulto Chat", client: "Alice B.", amount: 22.5, status: "Completato" },
  { id: "txn2", date: "2025-06-19", type: "Consulto Chiamata", client: "Marco V.", amount: 40.0, status: "Completato" },
  { id: "txn3", date: "2025-06-19", type: "Consulto Email", client: "Sofia N.", amount: 30.0, status: "Completato" },
  { id: "txn4", date: "2025-06-18", type: "Consulto Chat", client: "Luca R.", amount: 15.0, status: "Completato" },
  {
    id: "txn5",
    date: "2025-06-21",
    type: "Consulto Chiamata",
    client: "Giulia F.",
    amount: 50.0,
    status: "In Attesa Approvazione Cliente",
  },
]

export default function OperatorEarningsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-slate-800">Tesoro Astrale</h1>
      <CardDescription className="text-slate-500 -mt-4">
        Monitora i tuoi guadagni e l'andamento delle tue consulenze.
      </CardDescription>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <Card className="shadow-lg rounded-xl bg-gradient-to-br from-sky-400 to-sky-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Guadagni Odierni</CardTitle>
            <CalendarDays className="h-5 w-5 text-sky-100" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">€{dailyEarnings.toFixed(2)}</div>
            <p className="text-xs text-sky-50 pt-1">+5% rispetto a ieri (simulato)</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Guadagni Settimanali</CardTitle>
            <CalendarDays className="h-5 w-5 text-emerald-100" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">€{weeklyEarnings.toFixed(2)}</div>
            <p className="text-xs text-emerald-50 pt-1">-2% rispetto alla scorsa settimana (simulato)</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Guadagni Mensili</CardTitle>
            <CalendarDays className="h-5 w-5 text-amber-100" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">€{monthlyEarnings.toFixed(2)}</div>
            <p className="text-xs text-amber-50 pt-1">Mese corrente</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Guadagni Totali</CardTitle>
            <DollarSign className="h-5 w-5 text-purple-100" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">€{totalEarnings.toFixed(2)}</div>
            <p className="text-xs text-purple-50 pt-1">Dall'inizio della tua attività</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg rounded-xl bg-gradient-to-br from-rose-400 to-rose-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo in Attesa</CardTitle>
            <AlertTriangle className="h-5 w-5 text-rose-100" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">€{pendingEarnings.toFixed(2)}</div>
            <p className="text-xs text-rose-50 pt-1">Da consulti recenti</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-xl rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl text-slate-700 flex items-center">
            <BarChart3 className="mr-2 h-5 w-5 text-[hsl(var(--primary-medium))]" />
            Dettaglio Transazioni Recenti
          </CardTitle>
          <CardDescription className="text-slate-500">Ultime consulenze registrate e loro stato.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Tipo Consulto</TableHead>
                <TableHead>Cercatore</TableHead>
                <TableHead className="text-right">Importo</TableHead>
                <TableHead className="text-center">Stato</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{transaction.date}</TableCell>
                  <TableCell>{transaction.type}</TableCell>
                  <TableCell>{transaction.client}</TableCell>
                  <TableCell className="text-right">€{transaction.amount.toFixed(2)}</TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={
                        transaction.status === "Completato"
                          ? "default"
                          : transaction.status === "In Attesa Approvazione Cliente"
                            ? "outline"
                            : "secondary"
                      }
                      className={
                        transaction.status === "Completato"
                          ? "bg-green-500/15 text-green-700 border-green-500/30"
                          : transaction.status === "In Attesa Approvazione Cliente"
                            ? "bg-amber-500/15 text-amber-700 border-amber-500/30"
                            : ""
                      }
                    >
                      {transaction.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {recentTransactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-slate-500 py-8">
                    Nessuna transazione recente da mostrare.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {/* Placeholder per Grafici Avanzati */}
      <Card className="shadow-xl rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl text-slate-700">Andamento Guadagni (Placeholder)</CardTitle>
          <CardDescription className="text-slate-500">
            Visualizzazione grafica dei tuoi guadagni nel tempo.
          </CardDescription>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center bg-slate-50 rounded-b-2xl">
          <p className="text-slate-400">Grafico andamento guadagni (es. ultimi 30 giorni) apparirà qui.</p>
        </CardContent>
      </Card>
    </div>
  )
}
