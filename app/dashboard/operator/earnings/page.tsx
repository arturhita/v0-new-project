"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, TrendingUp, Euro, Download, Star, Clock, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function EarningsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("this_month")
  const [lastPaymentRequest, setLastPaymentRequest] = useState(new Date("2024-12-01")) // Ultima richiesta
  const [canRequestPayment, setCanRequestPayment] = useState(false)
  const [daysUntilNextRequest, setDaysUntilNextRequest] = useState(0)
  const { toast } = useToast()

  // Calcola se può richiedere pagamento (ogni 15 giorni)
  useEffect(() => {
    const now = new Date()
    const daysSinceLastRequest = Math.floor((now.getTime() - lastPaymentRequest.getTime()) / (1000 * 60 * 60 * 24))
    const canRequest = daysSinceLastRequest >= 15
    const daysLeft = Math.max(0, 15 - daysSinceLastRequest)

    setCanRequestPayment(canRequest)
    setDaysUntilNextRequest(daysLeft)
  }, [lastPaymentRequest])

  // Dati guadagni
  const earningsData = {
    today: { gross: 127.5, commission: 38.25, net: 89.25, consultations: 12 },
    week: { gross: 892.3, commission: 267.69, net: 624.61, consultations: 67 },
    month: { gross: 3247.8, commission: 974.34, net: 2273.46, consultations: 234 },
    total: { gross: 15678.9, commission: 4703.67, net: 10975.23, consultations: 1247 },
  }

  // Guadagni disponibili per richiesta pagamento (ultimi 15 giorni)
  const availableEarnings = {
    gross: 1456.8,
    commission: 437.04,
    net: 1019.76,
    consultations: 89,
    period: "01/12/2024 - 15/12/2024",
  }

  const dailyEarnings = [
    { date: "19/12/2024", consultations: 12, gross: 127.5, net: 89.25, hours: "6.5h" },
    { date: "18/12/2024", consultations: 8, gross: 89.2, net: 62.44, hours: "4.2h" },
    { date: "17/12/2024", consultations: 15, gross: 167.8, net: 117.46, hours: "7.8h" },
    { date: "16/12/2024", consultations: 10, gross: 112.3, net: 78.61, hours: "5.1h" },
    { date: "15/12/2024", consultations: 14, gross: 156.7, net: 109.69, hours: "6.9h" },
  ]

  const consultationTypes = [
    { type: "Tarocchi Amore", count: 45, earnings: 567.5, avgDuration: "18 min", avgRating: 4.9 },
    { type: "Oroscopo", count: 32, earnings: 384.0, avgDuration: "12 min", avgRating: 4.8 },
    { type: "Cartomanzia", count: 28, earnings: 420.0, avgDuration: "15 min", avgRating: 4.9 },
    { type: "Consulto Generale", count: 23, earnings: 345.0, avgDuration: "16 min", avgRating: 4.7 },
  ]

  const handleDownloadReport = () => {
    toast({
      title: "Download Avviato",
      description: "Scaricamento report guadagni in corso...",
    })

    setTimeout(() => {
      toast({
        title: "Download Completato",
        description: "Report guadagni scaricato con successo.",
      })
    }, 2000)
  }

  const handleRequestPayment = async () => {
    if (!canRequestPayment) {
      toast({
        title: "Richiesta Non Disponibile",
        description: `Puoi richiedere un pagamento ogni 15 giorni. Prossima richiesta disponibile tra ${daysUntilNextRequest} giorni.`,
        variant: "destructive",
      })
      return
    }

    if (availableEarnings.net < 50) {
      toast({
        title: "Importo Insufficiente",
        description: "L'importo minimo per richiedere un pagamento è di €50.",
        variant: "destructive",
      })
      return
    }

    try {
      // Simula invio richiesta all'admin
      const paymentRequest = {
        id: `PAY-REQ-${Date.now()}`,
        consultant: "Luna Stellare", // Dovrebbe venire dal profilo utente
        consultantEmail: "luna.stellare@example.com",
        amount: availableEarnings.gross,
        commission: availableEarnings.commission,
        netAmount: availableEarnings.net,
        requestDate: new Date().toLocaleDateString("it-IT"),
        status: "in_attesa",
        consultationsCount: availableEarnings.consultations,
        period: availableEarnings.period,
        paymentMethod: "Bonifico Bancario", // Dovrebbe venire dalle impostazioni
        iban: "IT60 X054 2811 1010 0000 0123 456", // Dovrebbe venire dalle impostazioni
      }

      // Qui dovresti inviare la richiesta al backend
      console.log("Richiesta pagamento inviata:", paymentRequest)

      // Aggiorna la data dell'ultima richiesta
      setLastPaymentRequest(new Date())

      toast({
        title: "Richiesta Inviata",
        description: `Richiesta di pagamento di €${availableEarnings.net.toFixed(2)} inviata all'amministrazione.`,
      })
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'invio della richiesta.",
        variant: "destructive",
      })
    }
  }

  const getNextRequestDate = () => {
    const nextDate = new Date(lastPaymentRequest)
    nextDate.setDate(nextDate.getDate() + 15)
    return nextDate.toLocaleDateString("it-IT")
  }

  return (
    <div className="space-y-6 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
            I Miei Guadagni
          </h2>
          <p className="text-muted-foreground">Monitora i tuoi guadagni e richiedi pagamenti</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleDownloadReport}>
            <Download className="mr-2 h-4 w-4" />
            Scarica Report
          </Button>
          <Button
            onClick={handleRequestPayment}
            disabled={!canRequestPayment || availableEarnings.net < 50}
            className={`${
              canRequestPayment && availableEarnings.net >= 50
                ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            <Euro className="mr-2 h-4 w-4" />
            Richiedi Pagamento
          </Button>
        </div>
      </div>

      {/* Payment Request Status */}
      <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            <Euro className="mr-2 h-5 w-5 text-green-500" />
            Stato Richieste Pagamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <div>
                  <h4 className="font-semibold text-green-800">Guadagni Disponibili</h4>
                  <p className="text-sm text-green-600">Periodo: {availableEarnings.period}</p>
                  <p className="text-xs text-green-600">{availableEarnings.consultations} consulenze</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-700">€{availableEarnings.net.toFixed(2)}</div>
                  <div className="text-sm text-green-600">Netto</div>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">Dettaglio Importi</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Guadagni Lordi:</span>
                    <span className="font-medium">€{availableEarnings.gross.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Commissione (30%):</span>
                    <span className="font-medium text-red-600">-€{availableEarnings.commission.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-semibold text-blue-800">Netto da Richiedere:</span>
                    <span className="font-bold text-green-600">€{availableEarnings.net.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div
                className={`p-4 rounded-lg border ${
                  canRequestPayment
                    ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
                    : "bg-gradient-to-r from-orange-50 to-red-50 border-orange-200"
                }`}
              >
                <div className="flex items-center space-x-3 mb-3">
                  {canRequestPayment ? (
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  ) : (
                    <Clock className="h-5 w-5 text-orange-500" />
                  )}
                  <h4 className={`font-semibold ${canRequestPayment ? "text-green-800" : "text-orange-800"}`}>
                    {canRequestPayment ? "Richiesta Disponibile" : "Richiesta Non Disponibile"}
                  </h4>
                </div>
                <p className={`text-sm ${canRequestPayment ? "text-green-700" : "text-orange-700"}`}>
                  {canRequestPayment
                    ? "Puoi richiedere un pagamento per i guadagni accumulati."
                    : `Prossima richiesta disponibile tra ${daysUntilNextRequest} giorni (${getNextRequestDate()}).`}
                </p>
              </div>

              <div className="p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-purple-800 mb-2">Informazioni Pagamento</h4>
                <div className="space-y-2 text-sm text-purple-700">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>Frequenza: ogni 15 giorni</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Euro className="h-4 w-4" />
                    <span>Importo minimo: €50</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>Ultima richiesta: {lastPaymentRequest.toLocaleDateString("it-IT")}</span>
                  </div>
                </div>
              </div>

              {availableEarnings.net < 50 && (
                <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    <h4 className="font-semibold text-yellow-800">Importo Insufficiente</h4>
                  </div>
                  <p className="text-sm text-yellow-700">
                    Hai bisogno di almeno €{(50 - availableEarnings.net).toFixed(2)} in più per richiedere un pagamento.
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-0 bg-gradient-to-r from-green-500 to-emerald-500 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-100">Oggi</CardTitle>
            <Euro className="h-4 w-4 text-green-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{earningsData.today.net}</div>
            <p className="text-xs text-green-100">{earningsData.today.consultations} consulenze</p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">Questa Settimana</CardTitle>
            <Calendar className="h-4 w-4 text-blue-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{earningsData.week.net}</div>
            <p className="text-xs text-blue-100">{earningsData.week.consultations} consulenze</p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-r from-purple-500 to-violet-500 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-100">Questo Mese</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{earningsData.month.net}</div>
            <p className="text-xs text-purple-100">{earningsData.month.consultations} consulenze</p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-r from-orange-500 to-amber-500 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-100">Totale</CardTitle>
            <Star className="h-4 w-4 text-orange-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{earningsData.total.net}</div>
            <p className="text-xs text-orange-100">{earningsData.total.consultations} consulenze</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Panoramica</TabsTrigger>
          <TabsTrigger value="daily">Giornaliero</TabsTrigger>
          <TabsTrigger value="types">Per Tipo</TabsTrigger>
          <TabsTrigger value="payments">Pagamenti</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle className="bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
                  Riepilogo Guadagni
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm">Guadagni Lordi (Mese)</span>
                  <span className="font-medium">€{earningsData.month.gross}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Commissione Piattaforma (30%)</span>
                  <span className="font-medium text-red-600">-€{earningsData.month.commission}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-medium">Guadagni Netti</span>
                  <span className="font-bold text-green-600">€{earningsData.month.net}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Media per consulenza</span>
                  <span className="font-medium">
                    €{(earningsData.month.net / earningsData.month.consultations).toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle className="bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm">Consulenze Totali</span>
                  <span className="font-medium">{earningsData.month.consultations}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Media Giornaliera</span>
                  <span className="font-medium">{Math.round(earningsData.month.consultations / 30)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Ore Lavorate (Stimate)</span>
                  <span className="font-medium">156h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Tariffa Oraria Media</span>
                  <span className="font-medium text-green-600">€{(earningsData.month.net / 156).toFixed(2)}/h</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="daily" className="space-y-4">
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle>Guadagni Giornalieri</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dailyEarnings.map((day, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gradient-to-r hover:from-pink-50 hover:to-blue-50 transition-all duration-300"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">{day.date}</p>
                        <p className="text-sm text-muted-foreground">
                          {day.consultations} consulenze • {day.hours}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-lg">€{day.net}</p>
                      <p className="text-sm text-muted-foreground">Lordo: €{day.gross}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="types" className="space-y-4">
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle>Guadagni per Tipo di Consulenza</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {consultationTypes.map((type, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gradient-to-r hover:from-pink-50 hover:to-blue-50 transition-all duration-300"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                        <Star className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium">{type.type}</p>
                        <p className="text-sm text-muted-foreground">
                          {type.count} consulenze • {type.avgDuration} media • ⭐ {type.avgRating}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-lg">€{type.earnings}</p>
                      <p className="text-sm text-muted-foreground">
                        €{(type.earnings / type.count).toFixed(2)} per consulenza
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle>Storico Pagamenti</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { date: "01/12/2024", amount: 1247.5, status: "completato", period: "Novembre 2024" },
                  { date: "01/11/2024", amount: 1156.3, status: "completato", period: "Ottobre 2024" },
                  { date: "15/12/2024", amount: 2273.46, status: "in_attesa", period: "Dicembre 2024" },
                ].map((payment, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-300"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg flex items-center justify-center">
                        <Euro className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">Pagamento {payment.period}</p>
                        <p className="text-sm text-muted-foreground">Richiesto il {payment.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-medium text-lg">€{payment.amount}</p>
                        <Badge
                          className={
                            payment.status === "completato"
                              ? "bg-green-500"
                              : payment.status === "in_attesa"
                                ? "bg-orange-500"
                                : "bg-gray-500"
                          }
                        >
                          {payment.status === "completato"
                            ? "Completato"
                            : payment.status === "in_attesa"
                              ? "In Attesa"
                              : "In Elaborazione"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
