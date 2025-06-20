"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import {
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Banknote,
} from "lucide-react"

export default function TransactionsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  // Transazioni in entrata (ricavi)
  const incomingTransactions = [
    {
      id: "TXN-IN-001",
      type: "consulenza",
      description: "Pagamento consulenza - Mario Rossi",
      amount: 57.5,
      commission: 17.25,
      netAmount: 40.25,
      date: "15/12/2024",
      time: "14:30",
      status: "completata",
      consultant: "Luna Stellare",
      client: "Mario Rossi",
      consultationId: "CONS-001",
      paymentMethod: "Carta di Credito",
    },
    {
      id: "TXN-IN-002",
      type: "ricarica_crediti",
      description: "Ricarica crediti - Giulia Verdi",
      amount: 100.0,
      commission: 0,
      netAmount: 100.0,
      date: "15/12/2024",
      time: "12:15",
      status: "completata",
      client: "Giulia Verdi",
      paymentMethod: "PayPal",
    },
    {
      id: "TXN-IN-003",
      type: "consulenza",
      description: "Pagamento consulenza - Luca Ferrari",
      amount: 77.5,
      commission: 23.25,
      netAmount: 54.25,
      date: "14/12/2024",
      time: "20:15",
      status: "in_elaborazione",
      consultant: "Cristal Mystic",
      client: "Luca Ferrari",
      consultationId: "CONS-003",
      paymentMethod: "Carta di Credito",
    },
  ]

  // Transazioni in uscita (pagamenti)
  const outgoingTransactions = [
    {
      id: "TXN-OUT-001",
      type: "pagamento_consulente",
      description: "Pagamento consulente - Luna Stellare",
      amount: 164.15,
      date: "10/12/2024",
      time: "09:00",
      status: "completato",
      consultant: "Luna Stellare",
      paymentMethod: "Bonifico Bancario",
      transactionId: "BANK-789456123",
      consultationsCount: 8,
    },
    {
      id: "TXN-OUT-002",
      type: "rimborso",
      description: "Rimborso consulenza - Anna Bianchi",
      amount: 30.0,
      date: "13/12/2024",
      time: "16:45",
      status: "completato",
      client: "Anna Bianchi",
      paymentMethod: "Carta di Credito",
      transactionId: "REF-456789012",
      reason: "Consulenza interrotta per problemi tecnici",
    },
    {
      id: "TXN-OUT-003",
      type: "pagamento_consulente",
      description: "Pagamento consulente - Maestro Cosmos",
      amount: 132.44,
      date: "08/12/2024",
      time: "10:30",
      status: "in_elaborazione",
      consultant: "Maestro Cosmos",
      paymentMethod: "PayPal",
      consultationsCount: 6,
    },
  ]

  const allTransactions = [
    ...incomingTransactions.map((t) => ({ ...t, direction: "in" })),
    ...outgoingTransactions.map((t) => ({ ...t, direction: "out" })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const filteredTransactions = allTransactions.filter((transaction) => {
    const matchesSearch =
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === "all" || transaction.type === typeFilter
    const matchesStatus = statusFilter === "all" || transaction.status === statusFilter
    return matchesSearch && matchesType && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completata":
      case "completato":
        return <Badge className="bg-green-500 hover:bg-green-600">Completato</Badge>
      case "in_elaborazione":
        return <Badge className="bg-blue-500 hover:bg-blue-600">In Elaborazione</Badge>
      case "fallita":
        return <Badge className="bg-red-500 hover:bg-red-600">Fallita</Badge>
      case "annullata":
        return <Badge variant="secondary">Annullata</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTypeIcon = (type: string, direction: string) => {
    if (direction === "in") {
      return <ArrowDownLeft className="h-4 w-4 text-green-600" />
    } else {
      return <ArrowUpRight className="h-4 w-4 text-red-600" />
    }
  }

  // Calcoli per le statistiche
  const totalIncoming = incomingTransactions
    .filter((t) => t.status === "completata")
    .reduce((sum, t) => sum + t.amount, 0)
  const totalOutgoing = outgoingTransactions
    .filter((t) => t.status === "completato")
    .reduce((sum, t) => sum + t.amount, 0)
  const totalCommissions = incomingTransactions
    .filter((t) => t.status === "completata")
    .reduce((sum, t) => sum + t.commission, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
            Transazioni e Ricevuti
          </h2>
          <p className="text-muted-foreground">Monitora tutti i movimenti finanziari della piattaforma</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Esporta
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ricavi Totali</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">€{totalIncoming.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">+18.2% dal mese scorso</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagamenti Uscita</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">€{totalOutgoing.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Pagamenti consulenti</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commissioni</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">€{totalCommissions.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Commissioni trattenute</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bilancio Netto</CardTitle>
            <Banknote className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">€{(totalIncoming - totalOutgoing).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Profitto netto</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">Tutte le Transazioni</TabsTrigger>
          <TabsTrigger value="incoming">Entrate</TabsTrigger>
          <TabsTrigger value="outgoing">Uscite</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filtri e Ricerca</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Cerca per ID o descrizione..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tutti i tipi</SelectItem>
                    <SelectItem value="consulenza">Consulenze</SelectItem>
                    <SelectItem value="ricarica_crediti">Ricariche Crediti</SelectItem>
                    <SelectItem value="pagamento_consulente">Pagamenti Consulenti</SelectItem>
                    <SelectItem value="rimborso">Rimborsi</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Stato" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tutti gli stati</SelectItem>
                    <SelectItem value="completata">Completate</SelectItem>
                    <SelectItem value="in_elaborazione">In Elaborazione</SelectItem>
                    <SelectItem value="fallita">Fallite</SelectItem>
                  </SelectContent>
                </Select>
                <DatePickerWithRange />
              </div>
            </CardContent>
          </Card>

          {/* Transactions List */}
          <Card>
            <CardHeader>
              <CardTitle>Lista Transazioni ({filteredTransactions.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        {getTypeIcon(transaction.type, transaction.direction)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold">{transaction.id}</h4>
                          {getStatusBadge(transaction.status)}
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>{transaction.description}</p>
                          <div className="flex items-center space-x-4">
                            <span>
                              {transaction.date} {transaction.time}
                            </span>
                            <span>{transaction.paymentMethod}</span>
                            {transaction.transactionId && <span>ID: {transaction.transactionId}</span>}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <p
                        className={`font-medium text-lg ${
                          transaction.direction === "in" ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {transaction.direction === "in" ? "+" : "-"}€{transaction.amount}
                      </p>
                      {transaction.commission > 0 && (
                        <p className="text-sm text-muted-foreground">Comm: €{transaction.commission}</p>
                      )}
                      {transaction.netAmount && transaction.direction === "in" && (
                        <p className="text-sm font-medium">Netto: €{transaction.netAmount}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="incoming" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-green-600">
                <ArrowDownLeft className="mr-2 h-5 w-5" />
                Transazioni in Entrata
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {incomingTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <ArrowDownLeft className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold">{transaction.id}</h4>
                          {getStatusBadge(transaction.status)}
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>{transaction.description}</p>
                          <div className="flex items-center space-x-4">
                            <span>
                              {transaction.date} {transaction.time}
                            </span>
                            <span>{transaction.paymentMethod}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-medium text-lg text-green-600">+€{transaction.amount}</p>
                      {transaction.commission > 0 && (
                        <p className="text-sm text-muted-foreground">Comm: €{transaction.commission}</p>
                      )}
                      <p className="text-sm font-medium">Netto: €{transaction.netAmount}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="outgoing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-red-600">
                <ArrowUpRight className="mr-2 h-5 w-5" />
                Transazioni in Uscita
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {outgoingTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                        <ArrowUpRight className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold">{transaction.id}</h4>
                          {getStatusBadge(transaction.status)}
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>{transaction.description}</p>
                          <div className="flex items-center space-x-4">
                            <span>
                              {transaction.date} {transaction.time}
                            </span>
                            <span>{transaction.paymentMethod}</span>
                            {transaction.transactionId && <span>ID: {transaction.transactionId}</span>}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-medium text-lg text-red-600">-€{transaction.amount}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Riepilogo Finanziario</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm">Ricavi consulenze</span>
                  <span className="font-medium text-green-600">€{totalIncoming.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Commissioni trattenute</span>
                  <span className="font-medium text-blue-600">€{totalCommissions.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Pagamenti consulenti</span>
                  <span className="font-medium text-red-600">€{totalOutgoing.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-semibold">Profitto netto</span>
                  <span className="font-bold text-purple-600">€{(totalIncoming - totalOutgoing).toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Metodi di Pagamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm">Carta di Credito</span>
                  <span className="font-medium">65%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">PayPal</span>
                  <span className="font-medium">25%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Bonifico Bancario</span>
                  <span className="font-medium">10%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
