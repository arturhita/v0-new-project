"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Download, CheckCircle, XCircle, Clock, Euro, Filter, Eye, CreditCard, Send } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function PaymentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedPayment, setSelectedPayment] = useState<any>(null)
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [actionType, setActionType] = useState("")
  const [actionNote, setActionNote] = useState("")
  const [paymentRequests, setPaymentRequests] = useState([
    {
      id: "PAY-REQ-001",
      consultant: "Luna Stellare",
      consultantEmail: "luna@example.com",
      amount: 234.5,
      commission: 70.35,
      netAmount: 164.15,
      requestDate: "15/12/2024",
      status: "in_attesa",
      consultationsCount: 8,
      period: "01/12/2024 - 15/12/2024",
      paymentMethod: "Bonifico Bancario",
      iban: "IT60 X054 2811 1010 0000 0123 456",
      avatar: "/placeholder.svg",
      consultations: [
        { id: "CONS-001", client: "Mario Rossi", amount: 57.5, date: "10/12/2024" },
        { id: "CONS-002", client: "Giulia Verdi", amount: 45.0, date: "12/12/2024" },
        { id: "CONS-003", client: "Luca Ferrari", amount: 77.5, date: "14/12/2024" },
        { id: "CONS-004", client: "Anna Bianchi", amount: 55.0, date: "15/12/2024" },
      ],
    },
    {
      id: "PAY-REQ-002",
      consultant: "Maestro Cosmos",
      consultantEmail: "cosmos@example.com",
      amount: 189.2,
      commission: 56.76,
      netAmount: 132.44,
      requestDate: "14/12/2024",
      status: "in_attesa",
      consultationsCount: 6,
      period: "01/12/2024 - 14/12/2024",
      paymentMethod: "PayPal",
      paypalEmail: "cosmos@paypal.com",
      avatar: "/placeholder.svg",
      consultations: [
        { id: "CONS-005", client: "Paolo Neri", amount: 62.5, date: "08/12/2024" },
        { id: "CONS-006", client: "Sara Rosa", amount: 50.0, date: "10/12/2024" },
        { id: "CONS-007", client: "Marco Blu", amount: 47.5, date: "13/12/2024" },
        { id: "CONS-008", client: "Elena Verde", amount: 30.0, date: "14/12/2024" },
      ],
    },
    {
      id: "PAY-REQ-003",
      consultant: "Cristal Mystic",
      consultantEmail: "cristal@example.com",
      amount: 156.8,
      commission: 47.04,
      netAmount: 109.76,
      requestDate: "13/12/2024",
      status: "approvato",
      consultationsCount: 5,
      period: "28/11/2024 - 13/12/2024",
      paymentMethod: "Bonifico Bancario",
      iban: "IT60 X054 2811 1010 0000 0789 012",
      avatar: "/placeholder.svg",
      approvedDate: "15/12/2024",
      approvedBy: "Admin",
      consultations: [
        { id: "CONS-009", client: "Roberto Gialli", amount: 70.0, date: "05/12/2024" },
        { id: "CONS-010", client: "Francesca Viola", amount: 37.5, date: "07/12/2024" },
        { id: "CONS-011", client: "Andrea Arancio", amount: 50.0, date: "11/12/2024" },
      ],
    },
  ])

  const [completedPayments, setCompletedPayments] = useState([
    {
      id: "PAY-COMP-001",
      consultant: "Divine Reader",
      amount: 345.6,
      netAmount: 241.92,
      paymentDate: "10/12/2024",
      method: "Bonifico Bancario",
      transactionId: "TXN-789456123",
      status: "completato",
      invoiceGenerated: true,
      invoiceId: "INV-2024-001",
    },
    {
      id: "PAY-COMP-002",
      consultant: "Sage Oracle",
      amount: 278.3,
      netAmount: 194.81,
      paymentDate: "08/12/2024",
      method: "PayPal",
      transactionId: "PP-456789012",
      status: "completato",
      invoiceGenerated: true,
      invoiceId: "INV-2024-002",
    },
  ])

  const { toast } = useToast()

  const filteredRequests = paymentRequests.filter((request) => {
    const matchesSearch =
      request.consultant.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || request.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleApprovePayment = (payment: any) => {
    setSelectedPayment(payment)
    setActionType("approve")
    setIsActionDialogOpen(true)
  }

  const handleRejectPayment = (payment: any) => {
    setSelectedPayment(payment)
    setActionType("reject")
    setIsActionDialogOpen(true)
  }

  const handleProcessPayment = (payment: any) => {
    setSelectedPayment(payment)
    setActionType("process")
    setIsActionDialogOpen(true)
  }

  const handleViewPayment = (payment: any) => {
    setSelectedPayment(payment)
    setIsViewDialogOpen(true)
  }

  const executeAction = () => {
    if (!selectedPayment) return

    if (actionType === "approve") {
      // Cambia stato da "in_attesa" a "approvato"
      setPaymentRequests((prev) =>
        prev.map((p) =>
          p.id === selectedPayment.id
            ? {
                ...p,
                status: "approvato",
                approvedDate: new Date().toLocaleDateString("it-IT"),
                approvedBy: "Admin",
              }
            : p,
        ),
      )
      toast({
        title: "Pagamento Approvato",
        description: `Richiesta di pagamento ${selectedPayment.id} approvata con successo.`,
      })
    } else if (actionType === "reject") {
      // Cambia stato da "in_attesa" a "rifiutato"
      setPaymentRequests((prev) =>
        prev.map((p) =>
          p.id === selectedPayment.id
            ? {
                ...p,
                status: "rifiutato",
                rejectedDate: new Date().toLocaleDateString("it-IT"),
                rejectedBy: "Admin",
                rejectionReason: actionNote,
              }
            : p,
        ),
      )
      toast({
        title: "Pagamento Rifiutato",
        description: `Richiesta di pagamento ${selectedPayment.id} rifiutata.`,
        variant: "destructive",
      })
    } else if (actionType === "process") {
      // Cambia stato da "approvato" a "completato" e genera fattura
      const completedPayment = {
        id: `PAY-COMP-${Date.now()}`,
        consultant: selectedPayment.consultant,
        amount: selectedPayment.amount,
        netAmount: selectedPayment.netAmount,
        paymentDate: new Date().toLocaleDateString("it-IT"),
        method: selectedPayment.paymentMethod,
        transactionId: `TXN-${Date.now()}`,
        status: "completato",
        invoiceGenerated: true,
        invoiceId: `INV-2024-${Date.now()}`,
      }

      // Rimuovi dalla lista richieste e aggiungi ai completati
      setPaymentRequests((prev) => prev.filter((p) => p.id !== selectedPayment.id))
      setCompletedPayments((prev) => [completedPayment, ...prev])

      // Genera automaticamente la fattura
      generateInvoice(selectedPayment)

      toast({
        title: "Pagamento Completato",
        description: `Pagamento processato e fattura generata automaticamente.`,
      })
    }

    setIsActionDialogOpen(false)
    setActionNote("")
  }

  const generateInvoice = (paymentData: any) => {
    const invoiceData = {
      id: `INV-2024-${Date.now()}`,
      consultantName: paymentData.consultant,
      consultantEmail: paymentData.consultantEmail,
      amount: paymentData.amount,
      commission: paymentData.commission,
      netAmount: paymentData.netAmount,
      date: new Date().toLocaleDateString("it-IT"),
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString("it-IT"),
      status: "inviata",
      period: paymentData.period,
      consultations: paymentData.consultations,
    }

    console.log("Fattura generata automaticamente:", invoiceData)

    // Qui dovresti salvare la fattura nel database
    // e inviarla via email al consulente

    toast({
      title: "Fattura Generata",
      description: `Fattura ${invoiceData.id} creata e inviata al consulente.`,
    })
  }

  const handleDownloadReport = () => {
    // Simula download report
    const csvContent = paymentRequests
      .map((p) => `${p.id},${p.consultant},${p.amount},${p.netAmount},${p.status},${p.requestDate}`)
      .join("\n")

    const blob = new Blob([`ID,Consulente,Importo,Netto,Stato,Data\n${csvContent}`], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `pagamenti_${new Date().toISOString().split("T")[0]}.csv`
    a.click()

    toast({
      title: "Report Scaricato",
      description: "Il report dei pagamenti è stato scaricato con successo.",
    })
  }

  const handleSendReminder = (paymentId: string) => {
    toast({
      title: "Promemoria Inviato",
      description: "Email di promemoria inviata al consulente.",
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completato":
        return <Badge className="bg-green-500 hover:bg-green-600">Completato</Badge>
      case "approvato":
        return <Badge className="bg-blue-500 hover:bg-blue-600">Approvato</Badge>
      case "in_attesa":
        return <Badge className="bg-orange-500 hover:bg-orange-600">In Attesa</Badge>
      case "rifiutato":
        return <Badge className="bg-red-500 hover:bg-red-600">Rifiutato</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const pendingCount = paymentRequests.filter((p) => p.status === "in_attesa").length
  const approvedCount = paymentRequests.filter((p) => p.status === "approvato").length
  const completedCount = completedPayments.length
  const rejectedCount = paymentRequests.filter((p) => p.status === "rifiutato").length

  const pendingAmount = paymentRequests.filter((p) => p.status === "in_attesa").reduce((sum, p) => sum + p.netAmount, 0)
  const approvedAmount = paymentRequests
    .filter((p) => p.status === "approvato")
    .reduce((sum, p) => sum + p.netAmount, 0)
  const completedAmount = completedPayments.reduce((sum, p) => sum + p.netAmount, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
            Gestione Pagamenti
          </h2>
          <p className="text-muted-foreground">Gestisci richieste di pagamento e transazioni</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleDownloadReport}>
            <Download className="mr-2 h-4 w-4" />
            Esporta Report
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Attesa</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">€{pendingAmount.toFixed(2)} totali</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approvati</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedCount}</div>
            <p className="text-xs text-muted-foreground">€{approvedAmount.toFixed(2)} totali</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completati</CardTitle>
            <Euro className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedCount}</div>
            <p className="text-xs text-muted-foreground">€{completedAmount.toFixed(2)} questo mese</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rifiutati</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rejectedCount}</div>
            <p className="text-xs text-muted-foreground">Da rivedere</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="requests" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="requests">Richieste Pagamento</TabsTrigger>
          <TabsTrigger value="completed">Pagamenti Completati</TabsTrigger>
          <TabsTrigger value="analytics">Analytics Pagamenti</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="mr-2 h-5 w-5" />
                Filtri e Ricerca
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Cerca per ID o consulente..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Stato" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tutti gli stati</SelectItem>
                    <SelectItem value="in_attesa">In Attesa</SelectItem>
                    <SelectItem value="approvato">Approvati</SelectItem>
                    <SelectItem value="rifiutato">Rifiutati</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Payment Requests List */}
          <Card>
            <CardHeader>
              <CardTitle>Richieste di Pagamento ({filteredRequests.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={request.avatar || "/placeholder.svg"} alt={request.consultant} />
                        <AvatarFallback>
                          {request.consultant
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold">{request.id}</h4>
                          {getStatusBadge(request.status)}
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>
                            <strong>{request.consultant}</strong>
                          </p>
                          <div className="flex items-center space-x-4">
                            <span>Periodo: {request.period}</span>
                            <span>{request.consultationsCount} consulenze</span>
                            <span>Richiesta: {request.requestDate}</span>
                          </div>
                          <p>Metodo: {request.paymentMethod}</p>
                          {request.approvedDate && <p className="text-blue-600">Approvato: {request.approvedDate}</p>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6">
                      <div className="text-right text-sm">
                        <p className="font-medium text-lg">€{request.amount}</p>
                        <p className="text-muted-foreground">Comm: €{request.commission}</p>
                        <p className="font-medium text-green-600">Netto: €{request.netAmount}</p>
                      </div>

                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleViewPayment(request)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {request.status === "in_attesa" && (
                          <>
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleApprovePayment(request)}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleRejectPayment(request)}>
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {request.status === "approvato" && (
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={() => handleProcessPayment(request)}
                          >
                            <CreditCard className="h-4 w-4 mr-1" />
                            Processa
                          </Button>
                        )}
                        {request.status === "rifiutato" && (
                          <Button size="sm" variant="outline" onClick={() => handleSendReminder(request.id)}>
                            <Send className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pagamenti Completati</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {completedPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold">{payment.id}</h4>
                        {getStatusBadge(payment.status)}
                        {payment.invoiceGenerated && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-600">
                            Fattura: {payment.invoiceId}
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>
                          <strong>{payment.consultant}</strong>
                        </p>
                        <p>Pagato: {payment.paymentDate}</p>
                        <p>Metodo: {payment.method}</p>
                        <p>ID Transazione: {payment.transactionId}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-lg">€{payment.amount}</p>
                      <p className="font-medium text-green-600">Netto: €{payment.netAmount}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Statistiche Mensili</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm">Pagamenti processati</span>
                  <span className="font-medium">{completedCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Importo totale</span>
                  <span className="font-medium">€{completedAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Commissioni trattenute</span>
                  <span className="font-medium">€{(completedAmount * 0.3).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Tempo medio approvazione</span>
                  <span className="font-medium">2.3 giorni</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Metodi di Pagamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm">Bonifico Bancario</span>
                  <span className="font-medium">78%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">PayPal</span>
                  <span className="font-medium">22%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm">Tasso approvazione</span>
                  <span className="font-medium text-green-600">94.2%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Pagamenti in ritardo</span>
                  <span className="font-medium text-red-600">2.1%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Reclami pagamenti</span>
                  <span className="font-medium">0.3%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Action Dialog */}
      <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve" && "Approva Richiesta Pagamento"}
              {actionType === "reject" && "Rifiuta Richiesta Pagamento"}
              {actionType === "process" && "Processa Pagamento"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "approve" &&
                `Conferma l'approvazione del pagamento di €${selectedPayment?.netAmount} per ${selectedPayment?.consultant}`}
              {actionType === "reject" && `Specifica il motivo del rifiuto per ${selectedPayment?.consultant}`}
              {actionType === "process" &&
                `Conferma il completamento del pagamento e la generazione automatica della fattura`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedPayment && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p>
                      <strong>Consulente:</strong> {selectedPayment.consultant}
                    </p>
                    <p>
                      <strong>Periodo:</strong> {selectedPayment.period}
                    </p>
                    <p>
                      <strong>Consulenze:</strong> {selectedPayment.consultationsCount}
                    </p>
                  </div>
                  <div>
                    <p>
                      <strong>Importo lordo:</strong> €{selectedPayment.amount}
                    </p>
                    <p>
                      <strong>Commissione:</strong> €{selectedPayment.commission}
                    </p>
                    <p>
                      <strong>Netto:</strong> €{selectedPayment.netAmount}
                    </p>
                  </div>
                </div>
              </div>
            )}
            {(actionType === "reject" || actionType === "approve" || actionType === "process") && (
              <Textarea
                placeholder={
                  actionType === "approve"
                    ? "Aggiungi una nota (opzionale)..."
                    : actionType === "reject"
                      ? "Specifica il motivo del rifiuto..."
                      : "Aggiungi note per il pagamento (opzionale)..."
                }
                value={actionNote}
                onChange={(e) => setActionNote(e.target.value)}
                required={actionType === "reject"}
              />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsActionDialogOpen(false)}>
              Annulla
            </Button>
            <Button
              className={
                actionType === "approve"
                  ? "bg-green-600 hover:bg-green-700"
                  : actionType === "process"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : ""
              }
              variant={actionType === "reject" ? "destructive" : "default"}
              onClick={executeAction}
              disabled={actionType === "reject" && !actionNote.trim()}
            >
              {actionType === "approve" && "Approva Pagamento"}
              {actionType === "reject" && "Rifiuta Richiesta"}
              {actionType === "process" && "Completa Pagamento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Payment Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Dettagli Richiesta - {selectedPayment?.id}</DialogTitle>
            <DialogDescription>Informazioni complete sulla richiesta di pagamento</DialogDescription>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <h4 className="font-semibold mb-2">Dati Consulente</h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <strong>Nome:</strong> {selectedPayment.consultant}
                    </p>
                    <p>
                      <strong>Email:</strong> {selectedPayment.consultantEmail}
                    </p>
                    <p>
                      <strong>Metodo:</strong> {selectedPayment.paymentMethod}
                    </p>
                    {selectedPayment.iban && (
                      <p>
                        <strong>IBAN:</strong> {selectedPayment.iban}
                      </p>
                    )}
                    {selectedPayment.paypalEmail && (
                      <p>
                        <strong>PayPal:</strong> {selectedPayment.paypalEmail}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Dettagli Richiesta</h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <strong>Periodo:</strong> {selectedPayment.period}
                    </p>
                    <p>
                      <strong>Consulenze:</strong> {selectedPayment.consultationsCount}
                    </p>
                    <p>
                      <strong>Richiesta:</strong> {selectedPayment.requestDate}
                    </p>
                    <p>
                      <strong>Stato:</strong> {selectedPayment.status}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Riepilogo Importi</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Totale Consulenze:</span>
                    <span className="font-medium">€{selectedPayment.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Commissione Piattaforma (30%):</span>
                    <span className="font-medium text-red-600">-€{selectedPayment.commission}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-semibold">Netto da Pagare:</span>
                    <span className="font-bold text-green-600">€{selectedPayment.netAmount}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Chiudi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
