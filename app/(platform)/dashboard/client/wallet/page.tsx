"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DollarSign, History, CreditCard, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { WalletRecharge } from "@/components/wallet-recharge"

interface Transaction {
  id: string
  date: string
  type: "Ricarica" | "Pagamento Consulto" | "Rimborso"
  description: string
  amount: number
  status: "Completato" | "In Attesa" | "Fallito"
}

export default function WalletPage() {
  const [currentBalance, setCurrentBalance] = useState(55.0)
  const [transactions] = useState<Transaction[]>([
    {
      id: "t1",
      date: "15 Giugno 2025",
      type: "Ricarica",
      description: "Ricarica con carta **** 1234",
      amount: 75.0,
      status: "Completato",
    },
    {
      id: "t2",
      date: "16 Giugno 2025",
      type: "Pagamento Consulto",
      description: "Consulto con Luna Stellare - Chat 30min",
      amount: -20.0,
      status: "Completato",
    },
    {
      id: "t3",
      date: "18 Giugno 2025",
      type: "Ricarica",
      description: "Ricarica con PayPal",
      amount: 50.0,
      status: "Completato",
    },
    {
      id: "t4",
      date: "20 Giugno 2025",
      type: "Pagamento Consulto",
      description: "Consulto con Sage Aurora - Chiamata 45min",
      amount: -45.0,
      status: "Completato",
    },
    {
      id: "t5",
      date: "22 Giugno 2025",
      type: "Rimborso",
      description: "Rimborso consulto cancellato",
      amount: 15.0,
      status: "Completato",
    },
  ])

  const getTransactionIcon = (type: Transaction["type"]) => {
    switch (type) {
      case "Ricarica":
      case "Rimborso":
        return <ArrowUpRight className="h-4 w-4 text-green-600" />
      case "Pagamento Consulto":
        return <ArrowDownRight className="h-4 w-4 text-red-600" />
      default:
        return <DollarSign className="h-4 w-4" />
    }
  }

  const getStatusBadge = (status: Transaction["status"]) => {
    const variants = {
      Completato: "default",
      "In Attesa": "secondary",
      Fallito: "destructive",
    } as const

    return <Badge variant={variants[status]}>{status}</Badge>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-slate-800">Il Mio Wallet</h1>

      {/* Saldo Attuale */}
      <Card className="shadow-xl rounded-xl bg-gradient-to-r from-sky-400 to-cyan-500 text-white">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <DollarSign className="h-8 w-8" />
            Saldo Attuale
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-5xl font-bold">€ {currentBalance.toFixed(2)}</div>
          <p className="text-sky-100 mt-2">Disponibile per consulenze</p>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Ricarica Wallet */}
        <WalletRecharge currentBalance={currentBalance} onBalanceUpdate={setCurrentBalance} />

        {/* Azioni Rapide */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Azioni Rapide</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start bg-transparent" variant="outline">
              <CreditCard className="mr-2 h-4 w-4" />
              Gestisci Metodi di Pagamento
            </Button>
            <Button className="w-full justify-start bg-transparent" variant="outline">
              <History className="mr-2 h-4 w-4" />
              Scarica Estratto Conto
            </Button>
            <Button className="w-full justify-start bg-transparent" variant="outline">
              <DollarSign className="mr-2 h-4 w-4" />
              Imposta Ricarica Automatica
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Storico Transazioni */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Storico Transazioni
          </CardTitle>
          <CardDescription>Le tue ultime transazioni e movimenti</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-center text-slate-500 py-8">Nessuna transazione registrata</p>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {getTransactionIcon(transaction.type)}
                    <div>
                      <p className="font-medium text-slate-900">{transaction.description}</p>
                      <p className="text-sm text-slate-500">
                        {transaction.date} • {transaction.type}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className={`font-semibold ${transaction.amount > 0 ? "text-green-600" : "text-red-600"}`}>
                      {transaction.amount > 0 ? "+" : ""}€{Math.abs(transaction.amount).toFixed(2)}
                    </p>
                    {getStatusBadge(transaction.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
