"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Send, DollarSign, History, Landmark, CreditCard } from "lucide-react"
import { PayoutPolicyInfo } from "@/components/payout-policy-info"

interface PayoutRequest {
  id: string
  date: string
  amount: number
  status: "In Attesa" | "Approvata" | "Rifiutata"
  method: string
  details?: string
}

const initialPayoutHistory: PayoutRequest[] = [
  {
    id: "p1",
    date: "2025-05-28",
    amount: 250.0,
    status: "Approvata",
    method: "PayPal",
    details: "operatore@paypal.com",
  },
  { id: "p2", date: "2025-04-15", amount: 180.5, status: "Approvata", method: "Bonifico", details: "IT...XYZ" },
  {
    id: "p3",
    date: "2025-06-10",
    amount: 120.0,
    status: "Rifiutata",
    method: "PayPal",
    details: "operatore@paypal.com - Dati non corretti",
  },
  { id: "p4", date: "2025-06-15", amount: 300.0, status: "In Attesa", method: "Bonifico", details: "IT...ABC" },
]

export default function PayoutsPage() {
  const [payoutAmount, setPayoutAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<"paypal" | "iban">("paypal")
  const [paypalEmail, setPaypalEmail] = useState("tuo.paypal@email.com")
  const [iban, setIban] = useState("")
  const [accountHolder, setAccountHolder] = useState("")
  const [bicSwift, setBicSwift] = useState("")

  const availableBalance = 320.75 // Esempio

  const lastPayoutRequest = initialPayoutHistory.find((req) => req.status === "In Attesa" || req.status === "Approvata")
  const lastRequestDate = lastPayoutRequest ? new Date(lastPayoutRequest.date) : null
  const daysSinceLastRequest = lastRequestDate
    ? Math.floor((new Date().getTime() - lastRequestDate.getTime()) / (1000 * 60 * 60 * 24))
    : 15
  const canRequestPayout = daysSinceLastRequest >= 15
  const daysUntilNextRequest = canRequestPayout ? 0 : 15 - daysSinceLastRequest

  const [payoutHistory, setPayoutHistory] = useState<PayoutRequest[]>(initialPayoutHistory)

  const handleRequestPayout = () => {
    if (!canRequestPayout) {
      alert(
        `Puoi richiedere un nuovo pagamento tra ${daysUntilNextRequest} giorni. Le richieste sono consentite ogni 15 giorni.`,
      )
      return
    }

    const amountToPay = Number.parseFloat(payoutAmount)
    if (isNaN(amountToPay) || amountToPay <= 0) {
      alert("L'importo da prelevare non è valido.")
      return
    }
    if (amountToPay > availableBalance) {
      alert("L'importo richiesto supera il saldo disponibile.")
      return
    }

    let details = ""
    let methodDisplay = ""

    if (paymentMethod === "paypal") {
      if (!paypalEmail || !/^\S+@\S+\.\S+$/.test(paypalEmail)) {
        alert("Inserisci un'email PayPal valida.")
        return
      }
      details = paypalEmail
      methodDisplay = "PayPal"
    } else if (paymentMethod === "iban") {
      if (!iban || !accountHolder) {
        alert("Per il bonifico, sono necessari Nome Intestatario e IBAN.")
        return
      }
      // Semplice validazione IBAN (lunghezza e caratteri, non correttezza formale completa)
      if (!/^[A-Z0-9]{15,34}$/.test(iban.replace(/\s/g, ""))) {
        alert("Formato IBAN non valido.")
        return
      }
      details = `IBAN: ${iban}, Int.: ${accountHolder}${bicSwift ? `, BIC: ${bicSwift}` : ""}`
      methodDisplay = "Bonifico Bancario"
    }

    const newRequest: PayoutRequest = {
      id: `p${payoutHistory.length + 1}-${Date.now()}`,
      date: new Date().toLocaleDateString("it-IT"),
      amount: amountToPay,
      status: "In Attesa",
      method: methodDisplay,
      details,
    }
    setPayoutHistory((prev) => [newRequest, ...prev])
    alert(
      `Richiesta di pagamento di €${amountToPay.toFixed(2)} tramite ${methodDisplay} inviata con successo! Riceverai una notifica quando verrà processata. (Simulazione)`,
    )
    setPayoutAmount("")
    // Non resetto i campi IBAN/PayPal per comodità
  }

  const getStatusBadgeVariant = (status: PayoutRequest["status"]) => {
    if (status === "Approvata") return "default" // Verde (shadcn default)
    if (status === "In Attesa") return "outline" // Giallo/Arancio (shadcn outline)
    if (status === "Rifiutata") return "destructive" // Rosso (shadcn destructive)
    return "secondary"
  }

  const isRequestDisabled =
    !canRequestPayout ||
    !payoutAmount ||
    Number.parseFloat(payoutAmount) <= 0 ||
    Number.parseFloat(payoutAmount) > availableBalance ||
    (paymentMethod === "paypal" && (!paypalEmail || !/^\S+@\S+\.\S+$/.test(paypalEmail))) ||
    (paymentMethod === "iban" && (!iban || !accountHolder || !/^[A-Z0-9]{15,34}$/.test(iban.replace(/\s/g, ""))))

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-slate-800">Richieste Compensi</h1>
      <CardDescription className="text-slate-500 -mt-4">
        Richiedi il pagamento dei tuoi guadagni accumulati.
      </CardDescription>

      <Card className="shadow-xl rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl text-slate-700">Richiedi un Nuovo Compenso</CardTitle>
          <CardDescription className="text-slate-500">
            Saldo disponibile per il prelievo:{" "}
            <span className="font-semibold text-[hsl(var(--primary-dark))]">€{availableBalance.toFixed(2)}</span>
            <br />
            <span className="text-sm">
              {canRequestPayout ? (
                <span className="text-emerald-600">✓ Puoi richiedere un nuovo pagamento</span>
              ) : (
                <span className="text-amber-600">
                  ⏳ Prossima richiesta disponibile tra {daysUntilNextRequest} giorni
                  {lastRequestDate && (
                    <span className="block text-xs text-slate-400">
                      Ultima richiesta: {lastRequestDate.toLocaleDateString("it-IT")}
                    </span>
                  )}
                </span>
              )}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="payoutAmount">
              Importo da Prelevare (€) <span className="text-red-500">*</span>
            </Label>
            <div className="relative mt-1">
              <DollarSign className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="payoutAmount"
                type="number"
                value={payoutAmount}
                onChange={(e) => setPayoutAmount(e.target.value)}
                placeholder={`Max. ${availableBalance.toFixed(2)}`}
                className="pl-8"
                min="1.00" // Minimo prelevabile
                step="0.01"
                max={availableBalance.toString()}
              />
            </div>
          </div>
          <div>
            <Label>
              Metodo di Pagamento <span className="text-red-500">*</span>
            </Label>
            <RadioGroup
              value={paymentMethod}
              onValueChange={(value) => setPaymentMethod(value as "paypal" | "iban")}
              className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              <Label
                htmlFor="paypal-method"
                className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-all ${paymentMethod === "paypal" ? "border-[hsl(var(--primary-medium))] ring-2 ring-[hsl(var(--primary-medium))]" : "border-slate-200 hover:border-slate-300"}`}
              >
                <RadioGroupItem value="paypal" id="paypal-method" />
                <CreditCard className="h-5 w-5 text-sky-600" /> PayPal
              </Label>
              <Label
                htmlFor="iban-method"
                className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-all ${paymentMethod === "iban" ? "border-[hsl(var(--primary-medium))] ring-2 ring-[hsl(var(--primary-medium))]" : "border-slate-200 hover:border-slate-300"}`}
              >
                <RadioGroupItem value="iban" id="iban-method" />
                <Landmark className="h-5 w-5 text-emerald-600" /> Bonifico Bancario
              </Label>
            </RadioGroup>
          </div>

          {paymentMethod === "paypal" && (
            <div className="p-4 border rounded-md bg-slate-50/50">
              <Label htmlFor="paypalEmail">
                Email PayPal <span className="text-red-500">*</span>
              </Label>
              <Input
                id="paypalEmail"
                type="email"
                value={paypalEmail}
                onChange={(e) => setPaypalEmail(e.target.value)}
                placeholder="La tua email PayPal"
                className="mt-1 bg-white"
              />
            </div>
          )}

          {paymentMethod === "iban" && (
            <div className="space-y-3 p-4 border rounded-md bg-slate-50/50">
              <h4 className="font-medium text-slate-600">Dettagli IBAN</h4>
              <div>
                <Label htmlFor="accountHolder">
                  Nome Intestatario Conto <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="accountHolder"
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  placeholder="Mario Rossi"
                  className="mt-1 bg-white"
                />
              </div>
              <div>
                <Label htmlFor="ibanValue">
                  IBAN <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="ibanValue"
                  value={iban}
                  onChange={(e) => setIban(e.target.value.toUpperCase().replace(/\s/g, ""))}
                  placeholder="IT00X0000000000000000000"
                  className="mt-1 bg-white"
                />
              </div>
              <div>
                <Label htmlFor="bicSwift">BIC/SWIFT (Opzionale)</Label>
                <Input
                  id="bicSwift"
                  value={bicSwift}
                  onChange={(e) => setBicSwift(e.target.value.toUpperCase())}
                  placeholder="UNCRITMMXXX"
                  className="mt-1 bg-white"
                />
              </div>
            </div>
          )}

          <Button
            onClick={handleRequestPayout}
            disabled={isRequestDisabled}
            className="w-full sm:w-auto bg-gradient-to-r from-[hsl(var(--primary-light))] to-[hsl(var(--primary-medium))] text-white shadow-md hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed py-3 text-base"
          >
            <Send className="mr-2 h-4 w-4" />
            {!canRequestPayout ? `Disponibile tra ${daysUntilNextRequest} giorni` : "Invia Richiesta"}
          </Button>
        </CardContent>
      </Card>

      <PayoutPolicyInfo />

      <Card className="shadow-xl rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl text-slate-700 flex items-center">
            <History className="mr-2 h-5 w-5 text-slate-500" /> Storico Richieste
          </CardTitle>
        </CardHeader>
        <CardContent>
          {payoutHistory.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Importo</TableHead>
                  <TableHead>Metodo</TableHead>
                  <TableHead>Dettagli</TableHead>
                  <TableHead className="text-center">Stato</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payoutHistory.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell>{req.date}</TableCell>
                    <TableCell className="text-right">€{req.amount.toFixed(2)}</TableCell>
                    <TableCell>{req.method}</TableCell>
                    <TableCell className="text-xs text-slate-500 max-w-[200px] truncate" title={req.details}>
                      {req.details}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={getStatusBadgeVariant(req.status)}>{req.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-slate-500 py-4">Nessuna richiesta di pagamento precedente.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
