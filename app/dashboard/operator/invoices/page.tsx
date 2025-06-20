"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Receipt, Search, Download, Eye, Calendar, Euro, FileText, Printer } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function OperatorInvoicesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const { toast } = useToast()

  // Dati azienda (dovrebbero venire dalle impostazioni admin)
  const companyData = {
    name: "ConsultaPro S.r.l.",
    address: "Via Roma 123",
    city: "Milano",
    postalCode: "20100",
    country: "Italia",
    vatNumber: "IT12345678901",
    fiscalCode: "12345678901",
    phone: "+39 02 1234567",
    email: "info@consultapro.it",
    website: "www.consultapro.it",
  }

  // Dati consulente (dovrebbero venire dal profilo utente)
  const consultantData = {
    name: "Luna Stellare",
    address: "Via Stelle 45",
    city: "Milano",
    postalCode: "20121",
    country: "Italia",
    vatNumber: "IT98765432109",
    fiscalCode: "STLLUN85C55F205X",
    phone: "+39 123 456 7890",
    email: "luna.stellare@example.com",
  }

  const invoices = [
    {
      id: "INV-2024-001",
      number: "LS-001/2024",
      amount: 234.5,
      commission: 70.35,
      netAmount: 164.15,
      date: "15/12/2024",
      dueDate: "30/12/2024",
      status: "pagata",
      paymentDate: "20/12/2024",
      period: "01/12/2024 - 15/12/2024",
      consultations: [
        { date: "10/12/2024", client: "Cliente #1234", duration: "23 min", amount: 57.5, type: "Tarocchi Amore" },
        { date: "12/12/2024", client: "Cliente #1235", duration: "18 min", amount: 45.0, type: "Oroscopo" },
        { date: "14/12/2024", client: "Cliente #1236", duration: "31 min", amount: 77.5, type: "Cartomanzia" },
        { date: "15/12/2024", client: "Cliente #1237", duration: "22 min", amount: 55.0, type: "Consulto Generale" },
      ],
    },
    {
      id: "INV-2024-002",
      number: "LS-002/2024",
      amount: 189.2,
      commission: 56.76,
      netAmount: 132.44,
      date: "30/11/2024",
      dueDate: "15/12/2024",
      status: "pagata",
      paymentDate: "10/12/2024",
      period: "16/11/2024 - 30/11/2024",
      consultations: [
        { date: "20/11/2024", client: "Cliente #1230", duration: "25 min", amount: 62.5, type: "Astrologia" },
        { date: "22/11/2024", client: "Cliente #1231", duration: "20 min", amount: 50.0, type: "Tarocchi" },
        { date: "25/11/2024", client: "Cliente #1232", duration: "19 min", amount: 47.5, type: "Numerologia" },
        { date: "28/11/2024", client: "Cliente #1233", duration: "12 min", amount: 30.0, type: "Consulto Breve" },
      ],
    },
    {
      id: "INV-2024-003",
      number: "LS-003/2024",
      amount: 156.8,
      commission: 47.04,
      netAmount: 109.76,
      date: "01/12/2024",
      dueDate: "16/12/2024",
      status: "inviata",
      paymentDate: null,
      period: "01/11/2024 - 15/11/2024",
      consultations: [
        { date: "05/11/2024", client: "Cliente #1227", duration: "28 min", amount: 70.0, type: "Lettura Tarocchi" },
        { date: "07/11/2024", client: "Cliente #1228", duration: "15 min", amount: 37.5, type: "Consulto Veloce" },
        { date: "11/11/2024", client: "Cliente #1229", duration: "20 min", amount: 50.0, type: "Cartomanzia" },
      ],
    },
  ]

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleViewInvoice = (invoice: any) => {
    setSelectedInvoice(invoice)
    setIsViewDialogOpen(true)
  }

  const handleDownloadInvoice = (invoice: any) => {
    try {
      // Genera il contenuto PDF della fattura
      const generateInvoicePDF = (invoiceData: any) => {
        const content = `
        FATTURA N. ${invoiceData.number}
        
        DATI AZIENDA:
        ${companyData.name}
        ${companyData.address}
        ${companyData.postalCode} ${companyData.city}, ${companyData.country}
        P.IVA: ${companyData.vatNumber}
        C.F.: ${companyData.fiscalCode}
        
        DATI CONSULENTE:
        ${consultantData.name}
        ${consultantData.address}
        ${consultantData.postalCode} ${consultantData.city}, ${consultantData.country}
        P.IVA: ${consultantData.vatNumber}
        C.F.: ${consultantData.fiscalCode}
        
        DETTAGLI FATTURA:
        Data Emissione: ${invoiceData.date}
        Periodo: ${invoiceData.period}
        Scadenza: ${invoiceData.dueDate}
        ${invoiceData.paymentDate ? `Data Pagamento: ${invoiceData.paymentDate}` : ""}
        
        CONSULENZE:
        ${invoiceData.consultations.map((c: any) => `${c.date} - ${c.type} - ${c.duration} - €${c.amount}`).join("\n")}
        
        RIEPILOGO:
        Totale Consulenze: €${invoiceData.amount}
        Commissione Piattaforma (30%): -€${invoiceData.commission}
        IMPORTO NETTO: €${invoiceData.netAmount}
        
        Stato: ${invoiceData.status.toUpperCase()}
      `
        return content
      }

      // Crea il file PDF simulato
      const pdfContent = generateInvoicePDF(invoice)
      const blob = new Blob([pdfContent], { type: "text/plain" })
      const url = window.URL.createObjectURL(blob)

      // Crea link per download
      const link = document.createElement("a")
      link.href = url
      link.download = `Fattura_${invoice.number.replace("/", "_")}.txt`
      document.body.appendChild(link)

      // Toast di inizio download
      toast({
        title: "Download Avviato",
        description: `Scaricamento fattura ${invoice.number} in corso...`,
      })

      // Avvia download
      link.click()

      // Pulizia
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      // Toast di completamento
      setTimeout(() => {
        toast({
          title: "Download Completato",
          description: `Fattura ${invoice.number} scaricata con successo.`,
        })
      }, 1000)
    } catch (error) {
      console.error("Errore durante il download:", error)
      toast({
        title: "Errore Download",
        description: "Si è verificato un errore durante il download della fattura.",
        variant: "destructive",
      })
    }
  }

  const handlePrintInvoice = (invoice: any) => {
    toast({
      title: "Stampa Avviata",
      description: `Invio fattura ${invoice.number} alla stampante...`,
    })
  }

  const handleDownloadAll = () => {
    try {
      toast({
        title: "Download Multiplo",
        description: `Preparazione download di ${filteredInvoices.length} fatture...`,
      })

      // Simula il download di tutte le fatture
      filteredInvoices.forEach((invoice, index) => {
        setTimeout(() => {
          handleDownloadInvoice(invoice)
        }, index * 500) // Ritardo di 500ms tra ogni download
      })

      setTimeout(
        () => {
          toast({
            title: "Download Completato",
            description: `Tutte le ${filteredInvoices.length} fatture sono state scaricate con successo.`,
          })
        },
        filteredInvoices.length * 500 + 1000,
      )
    } catch (error) {
      console.error("Errore durante il download multiplo:", error)
      toast({
        title: "Errore Download",
        description: "Si è verificato un errore durante il download delle fatture.",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pagata":
        return <Badge className="bg-green-500 hover:bg-green-600">Pagata</Badge>
      case "inviata":
        return <Badge className="bg-blue-500 hover:bg-blue-600">Inviata</Badge>
      case "scaduta":
        return <Badge className="bg-red-500 hover:bg-red-600">Scaduta</Badge>
      case "bozza":
        return <Badge variant="secondary">Bozza</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const totalEarnings = invoices.reduce((sum, inv) => sum + inv.netAmount, 0)
  const paidInvoices = invoices.filter((inv) => inv.status === "pagata").length
  const pendingAmount = invoices.filter((inv) => inv.status !== "pagata").reduce((sum, inv) => sum + inv.netAmount, 0)

  return (
    <div className="space-y-6 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
            Le Mie Fatture
          </h2>
          <p className="text-muted-foreground">Visualizza e scarica le tue fatture</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleDownloadAll}>
            <Download className="mr-2 h-4 w-4" />
            Scarica Tutte
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-0 bg-gradient-to-r from-green-500 to-emerald-500 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-100">Guadagni Totali</CardTitle>
            <Euro className="h-4 w-4 text-green-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{totalEarnings.toFixed(2)}</div>
            <p className="text-xs text-green-100">Netto ricevuto</p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">Fatture Pagate</CardTitle>
            <Receipt className="h-4 w-4 text-blue-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paidInvoices}</div>
            <p className="text-xs text-blue-100">Su {invoices.length} totali</p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-gradient-to-r from-orange-500 to-amber-500 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-100">In Attesa</CardTitle>
            <Calendar className="h-4 w-4 text-orange-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{pendingAmount.toFixed(2)}</div>
            <p className="text-xs text-orange-100">Da ricevere</p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-100">Questo Mese</CardTitle>
            <FileText className="h-4 w-4 text-purple-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-purple-100">Nuove fatture</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle>Filtri e Ricerca</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cerca per numero fattura..."
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
                <SelectItem value="bozza">Bozze</SelectItem>
                <SelectItem value="inviata">Inviate</SelectItem>
                <SelectItem value="pagata">Pagate</SelectItem>
                <SelectItem value="scaduta">Scadute</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Invoices List */}
      <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle>Lista Fatture ({filteredInvoices.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredInvoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gradient-to-r hover:from-pink-50 hover:to-blue-50 transition-all duration-300"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-pink-100 to-blue-100 rounded-lg flex items-center justify-center">
                    <Receipt className="h-6 w-6 text-pink-600" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold">{invoice.number}</h4>
                      {getStatusBadge(invoice.status)}
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Periodo: {invoice.period}</p>
                      <div className="flex items-center space-x-4">
                        <span>Emessa: {invoice.date}</span>
                        <span>Scadenza: {invoice.dueDate}</span>
                        {invoice.paymentDate && <span className="text-green-600">Pagata: {invoice.paymentDate}</span>}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="text-right text-sm">
                    <div className="space-y-1">
                      <p className="font-medium text-lg">€{invoice.amount}</p>
                      <p className="text-muted-foreground">Commissione: €{invoice.commission}</p>
                      <p className="font-medium text-green-600">Netto: €{invoice.netAmount}</p>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={() => handleViewInvoice(invoice)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDownloadInvoice(invoice)}>
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handlePrintInvoice(invoice)}>
                      <Printer className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* View Invoice Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Fattura - {selectedInvoice?.number}</DialogTitle>
            <DialogDescription>Dettagli completi della fattura</DialogDescription>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-6">
              {/* Invoice Header - Company & Consultant Data */}
              <div className="grid grid-cols-2 gap-6 p-4 bg-muted rounded-lg">
                <div>
                  <h4 className="font-semibold mb-2 text-blue-600">Dati Azienda</h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <strong>{companyData.name}</strong>
                    </p>
                    <p>{companyData.address}</p>
                    <p>
                      {companyData.postalCode} {companyData.city}, {companyData.country}
                    </p>
                    <p>P.IVA: {companyData.vatNumber}</p>
                    <p>C.F.: {companyData.fiscalCode}</p>
                    <p>Tel: {companyData.phone}</p>
                    <p>Email: {companyData.email}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-pink-600">Dati Consulente</h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <strong>{consultantData.name}</strong>
                    </p>
                    <p>{consultantData.address}</p>
                    <p>
                      {consultantData.postalCode} {consultantData.city}, {consultantData.country}
                    </p>
                    <p>P.IVA: {consultantData.vatNumber}</p>
                    <p>C.F.: {consultantData.fiscalCode}</p>
                    <p>Tel: {consultantData.phone}</p>
                    <p>Email: {consultantData.email}</p>
                  </div>
                </div>
              </div>

              {/* Invoice Details */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                <div>
                  <h4 className="font-semibold mb-2">Dettagli Fattura</h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <strong>Numero:</strong> {selectedInvoice.number}
                    </p>
                    <p>
                      <strong>Data Emissione:</strong> {selectedInvoice.date}
                    </p>
                    <p>
                      <strong>Scadenza:</strong> {selectedInvoice.dueDate}
                    </p>
                    <p>
                      <strong>Periodo:</strong> {selectedInvoice.period}
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Stato Pagamento</h4>
                  <div className="space-y-2">
                    {getStatusBadge(selectedInvoice.status)}
                    {selectedInvoice.paymentDate && (
                      <p className="text-sm text-green-600">
                        <strong>Pagata il:</strong> {selectedInvoice.paymentDate}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Consultations Details */}
              <div>
                <h4 className="font-semibold mb-3">Dettaglio Consulenze</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {selectedInvoice.consultations.map((consultation: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded hover:bg-muted/50">
                      <div>
                        <p className="font-medium">{consultation.type}</p>
                        <p className="text-sm text-muted-foreground">
                          {consultation.date} - {consultation.duration} - {consultation.client}
                        </p>
                      </div>
                      <p className="font-medium">€{consultation.amount}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Invoice Summary */}
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                <h4 className="font-semibold mb-3">Riepilogo Importi</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Totale Consulenze:</span>
                    <span className="font-medium">€{selectedInvoice.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Commissione Piattaforma (30%):</span>
                    <span className="font-medium text-red-600">-€{selectedInvoice.commission}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-semibold">Importo Netto:</span>
                    <span className="font-bold text-green-600 text-lg">€{selectedInvoice.netAmount}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Chiudi
            </Button>
            <Button onClick={() => handlePrintInvoice(selectedInvoice)}>
              <Printer className="mr-2 h-4 w-4" />
              Stampa
            </Button>
            <Button onClick={() => handleDownloadInvoice(selectedInvoice)}>
              <Download className="mr-2 h-4 w-4" />
              Scarica PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
