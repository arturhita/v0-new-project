"use client"
import { useState } from "react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { PayoutsClientPage } from "./payouts-client-page"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Send, DollarSign, History, Landmark, CreditCard } from 'lucide-react'
import { PayoutPolicyInfo } from "@/components/payout-policy-info"
import { Label, Input, RadioGroup, Button } from "@/components/ui"

interface PayoutRequest {
  id: string
  date: string
  amount: number
  status: "pending" | "completed" | "failed"
  method: string
  details?: string
  requested_at: string
  completed_at?: string
}

export default async function OperatorPayoutsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("earnings_balance, stripe_account_id, stripe_account_status")
    .eq("user_id", user.id)
    .single()

  const { data: payouts, error: payoutsError } = await supabase
    .from("payouts")
    .select("*")
    .eq("operator_id", user.id)
    .order("requested_at", { ascending: false })

  const [payoutAmount, setPayoutAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<"paypal" | "iban">("paypal")
  const [paypalEmail, setPaypalEmail] = useState("tuo.paypal@email.com")
  const [iban, setIban] = useState("")
  const [accountHolder, setAccountHolder] = useState("")
  const [bicSwift, setBicSwift] = useState("")

  const availableBalance = profile ? profile.earnings_balance : 0 // Esempio

  const lastPayoutRequest = payouts ? payouts.find((req) => req.status === "pending" || req.status === "completed") : null
  const lastRequestDate = lastPayoutRequest ? new Date(lastPayoutRequest.requested_at) : null
  const daysSinceLastRequest = lastRequestDate
    ? Math.floor((new Date().getTime() - lastRequestDate.getTime()) / (1000 * 60 * 60 * 24))
    : 15
  const canRequestPayout = daysSinceLastRequest >= 15
  const daysUntilNextRequest = canRequestPayout ? 0 : 15 - daysSinceLastRequest

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return "N/A"
    return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">In attesa</Badge>
      case "completed":
        return <Badge variant="default">Completato</Badge>
      case "failed":
        return <Badge variant="destructive">Fallito</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

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
      id: `p${payouts ? payouts.length + 1 : 1}-${Date.now()}`,
      date: new Date().toLocaleDateString("it-IT"),
      amount: amountToPay,
      status: "pending",
      method: methodDisplay,
      details,
      requested_at: new Date().toISOString(),
    }

    // Simulazione di invio della richiesta di pagamento
    alert(
      `Richiesta di pagamento di €${amountToPay.toFixed(2)} tramite ${methodDisplay} inviata con successo! Riceverai una notifica quando verrà processata. (Simulazione)`,
    )
    setPayoutAmount("")
    // Non resetto i campi IBAN/PayPal per comodità
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

      <PayoutsClientPage profile={profile} />

      <Card className="shadow-xl rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl text-slate-700">Richiedi un Nuovo Compenso</CardTitle>
          <CardDescription className="text-slate-500">
            Saldo disponibile per il prelievo:{" "}
            <span className="font-semibold text-[hsl(var(--primary-dark))]">{formatCurrency(availableBalance)}</span>
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
                placeholder={`Max. ${formatCurrency(availableBalance)}`}
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
                <CreditCard className="h-5 w-5 text-sky-600" /> PayPal
              </Label>
              <Label
                htmlFor="iban-method"
                className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-all ${paymentMethod === "iban" ? "border-[hsl(var(--primary-medium))] ring-2 ring-[hsl(var(--primary-medium))]" : "border-slate-200 hover:border-slate-300"}`}
              >
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
          {payouts && payouts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data Richiesta</TableHead>
                  <TableHead className="text-right">Importo</TableHead>
                  <TableHead>Metodo</TableHead>
                  <TableHead>Dettagli</TableHead>
                  <TableHead className="text-center">Stato</TableHead>
                  <TableHead>Data Completamento</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payouts.map((payout) => (
                  <TableRow key={payout.id}>
                    <TableCell>{new Date(payout.requested_at).toLocaleDateString("it-IT")}</TableCell>
                    <TableCell className="text-right">{formatCurrency(payout.amount)}</TableCell>
                    <TableCell>{payout.method}</TableCell>
                    <TableCell className="text-xs text-slate-500 max-w-[200px] truncate" title={payout.details}>
                      {payout.details}
                    </TableCell>
                    <TableCell className="text-center">
                      {getStatusBadge(payout.status)}
                    </TableCell>
                    <TableCell>{payout.completed_at ? new Date(payout.completed_at).toLocaleDateString("it-IT") : "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-slate-500 py-4">Nessuna richiesta di pagamento trovata.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
