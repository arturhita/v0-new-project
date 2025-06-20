"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  CreditCard,
  Plus,
  History,
  TrendingUp,
  Wallet,
  Gift,
  Star,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"

const creditPackages = [
  {
    id: 1,
    amount: 25,
    price: 25,
    bonus: 0,
    popular: false,
  },
  {
    id: 2,
    amount: 50,
    price: 50,
    bonus: 5,
    popular: false,
  },
  {
    id: 3,
    amount: 100,
    price: 100,
    bonus: 15,
    popular: true,
  },
  {
    id: 4,
    amount: 200,
    price: 200,
    bonus: 40,
    popular: false,
  },
  {
    id: 5,
    amount: 500,
    price: 500,
    bonus: 125,
    popular: false,
  },
]

const creditHistory = [
  {
    id: 1,
    type: "ricarica",
    amount: 100,
    bonus: 15,
    date: "2024-01-15",
    method: "Carta di Credito",
    status: "completata",
  },
  {
    id: 2,
    type: "spesa",
    amount: -37.5,
    description: "Consulenza con Luna Stellare",
    date: "2024-01-15",
    status: "completata",
  },
  {
    id: 3,
    type: "spesa",
    amount: -70.4,
    description: "Consulenza con Maestro Cosmos",
    date: "2024-01-14",
    status: "completata",
  },
  {
    id: 4,
    type: "ricarica",
    amount: 50,
    bonus: 5,
    date: "2024-01-10",
    method: "PayPal",
    status: "completata",
  },
  {
    id: 5,
    type: "spesa",
    amount: -50.4,
    description: "Consulenza con Cristal Mystic",
    date: "2024-01-12",
    status: "completata",
  },
]

export default function CreditsPage() {
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("card")

  const currentBalance = 45.5
  const totalSpent = creditHistory.filter((h) => h.type === "spesa").reduce((sum, h) => sum + Math.abs(h.amount), 0)
  const totalRecharged = creditHistory
    .filter((h) => h.type === "ricarica")
    .reduce((sum, h) => sum + h.amount + (h.bonus || 0), 0)

  const handleRecharge = (packageId?: number) => {
    if (packageId) {
      const pkg = creditPackages.find((p) => p.id === packageId)
      if (pkg) {
        console.log(`Ricarica di €${pkg.price} con bonus di €${pkg.bonus}`)
        // Here you would integrate with your payment processor
      }
    } else if (customAmount) {
      console.log(`Ricarica personalizzata di €${customAmount}`)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
          Ricarica Crediti
        </h1>
        <p className="text-muted-foreground mt-2">Gestisci i tuoi crediti per le consulenze</p>
      </div>

      {/* Current Balance */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-0 bg-gradient-to-r from-pink-500 to-pink-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-pink-100 text-sm">Saldo Attuale</p>
                <p className="text-3xl font-bold">€{currentBalance.toFixed(2)}</p>
              </div>
              <Wallet className="h-8 w-8 text-pink-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Totale Ricaricato</p>
                <p className="text-3xl font-bold">€{totalRecharged.toFixed(2)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Totale Speso</p>
                <p className="text-3xl font-bold">€{totalSpent.toFixed(2)}</p>
              </div>
              <ArrowDownRight className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm">Bonus Ricevuti</p>
                <p className="text-3xl font-bold">
                  €
                  {(
                    totalRecharged -
                    creditHistory.filter((h) => h.type === "ricarica").reduce((sum, h) => sum + h.amount, 0)
                  ).toFixed(2)}
                </p>
              </div>
              <Gift className="h-8 w-8 text-indigo-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Credit Packages */}
        <Card className="lg:col-span-2 border-0 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
              Pacchetti Crediti
            </CardTitle>
            <CardDescription>Scegli il pacchetto più adatto alle tue esigenze</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {creditPackages.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-300 ${
                    selectedPackage === pkg.id
                      ? "border-pink-500 bg-pink-50"
                      : "border-gray-200 hover:border-pink-300 hover:bg-pink-25"
                  } ${pkg.popular ? "ring-2 ring-blue-500" : ""}`}
                  onClick={() => setSelectedPackage(pkg.id)}
                >
                  {pkg.popular && (
                    <Badge className="absolute -top-2 left-4 bg-gradient-to-r from-blue-500 to-blue-600">
                      <Star className="mr-1 h-3 w-3" />
                      Più Popolare
                    </Badge>
                  )}
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">€{pkg.amount}</div>
                    {pkg.bonus > 0 && <div className="text-sm text-green-600 font-medium">+ €{pkg.bonus} bonus</div>}
                    <div className="text-lg font-semibold text-pink-600 mt-2">€{pkg.price}</div>
                    {pkg.bonus > 0 && <div className="text-xs text-gray-500">Totale: €{pkg.amount + pkg.bonus}</div>}
                  </div>
                </div>
              ))}
            </div>

            {/* Custom Amount */}
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-3">Importo Personalizzato</h4>
              <div className="flex space-x-4">
                <div className="flex-1">
                  <Label htmlFor="customAmount">Importo (€)</Label>
                  <Input
                    id="customAmount"
                    type="number"
                    min="10"
                    max="1000"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="Inserisci importo"
                    className="border-pink-200 focus:border-pink-400"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={() => handleRecharge()}
                    disabled={!customAmount || Number.parseFloat(customAmount) < 10}
                    className="bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Ricarica
                  </Button>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Importo minimo: €10</p>
            </div>
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
              Metodo di Pagamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div
                className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                  paymentMethod === "card" ? "border-pink-500 bg-pink-50" : "border-gray-200"
                }`}
                onClick={() => setPaymentMethod("card")}
              >
                <div className="flex items-center space-x-3">
                  <CreditCard className="h-5 w-5 text-pink-600" />
                  <div>
                    <p className="font-medium">Carta di Credito</p>
                    <p className="text-xs text-gray-500">Visa, Mastercard, American Express</p>
                  </div>
                </div>
              </div>
              <div
                className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                  paymentMethod === "paypal" ? "border-pink-500 bg-pink-50" : "border-gray-200"
                }`}
                onClick={() => setPaymentMethod("paypal")}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">P</span>
                  </div>
                  <div>
                    <p className="font-medium">PayPal</p>
                    <p className="text-xs text-gray-500">Pagamento sicuro con PayPal</p>
                  </div>
                </div>
              </div>
              <div
                className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                  paymentMethod === "bank" ? "border-pink-500 bg-pink-50" : "border-gray-200"
                }`}
                onClick={() => setPaymentMethod("bank")}
              >
                <div className="flex items-center space-x-3">
                  <Wallet className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">Bonifico Bancario</p>
                    <p className="text-xs text-gray-500">Trasferimento diretto</p>
                  </div>
                </div>
              </div>
            </div>

            {selectedPackage && (
              <div className="pt-4 border-t">
                <Button
                  onClick={() => handleRecharge(selectedPackage)}
                  className="w-full bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600"
                  size="lg"
                >
                  <CreditCard className="mr-2 h-5 w-5" />
                  Procedi al Pagamento
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Credit History */}
      <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
            <History className="mr-2 h-5 w-5 text-blue-500" />
            Storico Movimenti
          </CardTitle>
          <CardDescription>Le tue ultime transazioni</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {creditHistory.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.type === "ricarica" ? "bg-green-100" : "bg-red-100"
                    }`}
                  >
                    {transaction.type === "ricarica" ? (
                      <ArrowUpRight className="h-5 w-5 text-green-600" />
                    ) : (
                      <ArrowDownRight className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {transaction.type === "ricarica" ? "Ricarica Crediti" : "Spesa Consulenza"}
                    </p>
                    <p className="text-sm text-gray-600">{transaction.description || transaction.method}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Calendar className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {new Date(transaction.date).toLocaleDateString("it-IT")}
                      </span>
                      <Badge
                        variant={transaction.status === "completata" ? "default" : "secondary"}
                        className={transaction.status === "completata" ? "bg-green-500" : ""}
                      >
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`text-lg font-semibold ${
                      transaction.type === "ricarica" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {transaction.type === "ricarica" ? "+" : ""}€{Math.abs(transaction.amount).toFixed(2)}
                  </p>
                  {transaction.bonus && transaction.bonus > 0 && (
                    <p className="text-sm text-green-600">+€{transaction.bonus} bonus</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
