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
import { Receipt, Search, Download, Eye, Send, Calendar, Euro, Plus } from "lucide-react"
import { Label } from "@/components/ui/label"

export default function InvoicesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isNewInvoiceDialogOpen, setIsNewInvoiceDialogOpen] = useState(false)
  const [newInvoiceData, setNewInvoiceData] = useState({
    consultantId: "",
    consultantName: "",
    consultantEmail: "",
    period: { from: "", to: "" },
    consultations: [],
    totalAmount: 0,
    commission: 0,
    netAmount: 0,
  })

  const consultants = [
    { id: 1, name: "Luna Stellare", email: "luna@example.com", specialty: "Cartomante & Tarocchi" },
    { id: 2, name: "Maestro Cosmos", email: "cosmos@example.com", specialty: "Astrologo" },
    { id: 3, name: "Cristal Mystic", email: "cristal@example.com", specialty: "Cristalloterapia" },
  ]

  const invoices = [
    {
      id: "INV-2024-001",
      consultantName: "Luna Stellare",
      consultantEmail: "luna@example.com",
      amount: 234.5,
      commission: 70.35,
      netAmount: 164.15,
      date: "15/12/2024",
      dueDate: "30/12/2024",
      status: "pagata",
      paymentDate: "20/12/2024",
      consultations: [
        { date: "10/12/2024", client: "Mario Rossi", duration: "23 min", amount: 57.5 },
        { date: "12/12/2024", client: "Giulia Verdi", duration: "18 min", amount: 45.0 },
        { date: "14/12/2024", client: "Luca Ferrari", duration: "31 min", amount: 77.5 },
        { date: "15/12/2024", client: "Anna Bianchi", duration: "22 min", amount: 55.0 },
      ],
    },
    {
      id: "INV-2024-002",
      consultantName: "Maestro Cosmos",
      consultantEmail: "cosmos@example.com",
      amount: 189.2,
      commission: 56.76,
      netAmount: 132.44,
      date: "14/12/2024",
      dueDate: "29/12/2024",
      status: "inviata",
      paymentDate: null,
      consultations: [
        { date: "08/12/2024", client: "Paolo Neri", duration: "25 min", amount: 62.5 },
        { date: "10/12/2024", client: "Sara Rosa", duration: "20 min", amount: 50.0 },
        { date: "13/12/2024", client: "Marco Blu", duration: "19 min", amount: 47.5 },
        { date: "14/12/2024", client: "Elena Verde", duration: "12 min", amount: 30.0 },
      ],
    },
    {
      id: "INV-2024-003",
      consultantName: "Cristal Mystic",
      consultantEmail: "cristal@example.com",
      amount: 156.8,
      commission: 47.04,
      netAmount: 109.76,
      date: "13/12/2024",
      dueDate: "28/12/2024",
      status: "bozza",
      paymentDate: null,
      consultations: [
        { date: "05/12/2024", client: "Roberto Gialli", duration: "28 min", amount: 70.0 },
        { date: "07/12/2024", client: "Francesca Viola", duration: "15 min", amount: 37.5 },
        { date: "11/12/2024", client: "Andrea Arancio", duration: "20 min", amount: 50.0 },
      ],
    },
  ]

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.consultantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleViewInvoice = (invoice: any) => {
    setSelectedInvoice(invoice)
    setIsViewDialogOpen(true)
  }

  const handleDownloadInvoice = (invoiceId: string) => {
    console.log("Download fattura:", invoiceId)
    // Implementa logica download PDF
  }

  const handleSendInvoice = (invoiceId: string) => {
    console.log("Invia fattura:", invoiceId)
    // Implementa logica invio email
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
            Gestione Fatture
          </h2>
          <p className="text-muted-foreground">Gestisci tutte le fatture emesse ai consulenti</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setIsNewInvoiceDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nuova Fattura
          </Button>
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
            <CardTitle className="text-sm font-medium">Fatture Totali</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-muted-foreground">+23 questo mese</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fatture Pagate</CardTitle>
            <Euro className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,089</div>
            <p className="text-xs text-muted-foreground">87.3% del totale</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Attesa</CardTitle>
            <Calendar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">134</div>
            <p className="text-xs text-muted-foreground">Da pagare</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Importo Totale</CardTitle>
            <Euro className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€89,456</div>
            <p className="text-xs text-muted-foreground">Questo mese</p>
          </CardContent>
        </Card>
      </div>

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
                  placeholder="Cerca per numero fattura o consulente..."
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
      <Card>
        <CardHeader>
          <CardTitle>Lista Fatture ({filteredInvoices.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredInvoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                    <Receipt className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold">{invoice.id}</h4>
                      {getStatusBadge(invoice.status)}
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>{invoice.consultantName}</p>
                      <div className="flex items-center space-x-4">
                        <span>Data: {invoice.date}</span>
                        <span>Scadenza: {invoice.dueDate}</span>
                        {invoice.paymentDate && <span>Pagata: {invoice.paymentDate}</span>}
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
                    <Button size="sm" variant="outline" onClick={() => handleDownloadInvoice(invoice.id)}>
                      <Download className="h-4 w-4" />
                    </Button>
                    {invoice.status !== "pagata" && (
                      <Button size="sm" variant="outline" onClick={() => handleSendInvoice(invoice.id)}>
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

      {/* New Invoice Dialog */}
      <Dialog open={isNewInvoiceDialogOpen} onOpenChange={setIsNewInvoiceDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Genera Nuova Fattura</DialogTitle>
            <DialogDescription>Crea una fattura manuale per un consulente</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="consultant">Consulente</Label>
              <Select
                value={newInvoiceData.consultantId}
                onValueChange={(value) => {
                  const consultant = consultants.find((c) => c.id.toString() === value)
                  setNewInvoiceData({
                    ...newInvoiceData,
                    consultantId: value,
                    consultantName: consultant?.name || "",
                    consultantEmail: consultant?.email || "",
                  })
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona consulente" />
                </SelectTrigger>
                <SelectContent>
                  {consultants.map((consultant) => (
                    <SelectItem key={consultant.id} value={consultant.id.toString()}>
                      {consultant.name} - {consultant.specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateFrom">Data Inizio</Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={newInvoiceData.period.from}
                  onChange={(e) =>
                    setNewInvoiceData({
                      ...newInvoiceData,
                      period: { ...newInvoiceData.period, from: e.target.value },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateTo">Data Fine</Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={newInvoiceData.period.to}
                  onChange={(e) =>
                    setNewInvoiceData({
                      ...newInvoiceData,
                      period: { ...newInvoiceData.period, to: e.target.value },
                    })
                  }
                />
              </div>
            </div>

            {newInvoiceData.consultantId && newInvoiceData.period.from && newInvoiceData.period.to && (
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Anteprima Fattura</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Consulente:</span>
                    <span>{newInvoiceData.consultantName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Periodo:</span>
                    <span>
                      {newInvoiceData.period.from} - {newInvoiceData.period.to}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Consulenze trovate:</span>
                    <span>12</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Totale lordo:</span>
                    <span>€456.80</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Commissione (30%):</span>
                    <span className="text-red-600">-€137.04</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 font-semibold">
                    <span>Netto da fatturare:</span>
                    <span className="text-green-600">€319.76</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewInvoiceDialogOpen(false)}>
              Annulla
            </Button>
            <Button
              onClick={() => {
                console.log("Genera fattura:", newInvoiceData)
                setIsNewInvoiceDialogOpen(false)
              }}
              disabled={!newInvoiceData.consultantId || !newInvoiceData.period.from || !newInvoiceData.period.to}
            >
              Genera Fattura
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Invoice Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Dettagli Fattura - {selectedInvoice?.id}</DialogTitle>
            <DialogDescription>Fattura per {selectedInvoice?.consultantName}</DialogDescription>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-6">
              {/* Invoice Header */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <h4 className="font-semibold mb-2">Dati Fattura</h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <strong>Numero:</strong> {selectedInvoice.id}
                    </p>
                    <p>
                      <strong>Data:</strong> {selectedInvoice.date}
                    </p>
                    <p>
                      <strong>Scadenza:</strong> {selectedInvoice.dueDate}
                    </p>
                    <p>
                      <strong>Stato:</strong> {selectedInvoice.status}
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Consulente</h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <strong>Nome:</strong> {selectedInvoice.consultantName}
                    </p>
                    <p>
                      <strong>Email:</strong> {selectedInvoice.consultantEmail}
                    </p>
                  </div>
                </div>
              </div>

              {/* Consultations Details */}
              <div>
                <h4 className="font-semibold mb-3">Dettaglio Consulenze</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedInvoice.consultations.map((consultation: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium">{consultation.client}</p>
                        <p className="text-sm text-muted-foreground">
                          {consultation.date} - {consultation.duration}
                        </p>
                      </div>
                      <p className="font-medium">€{consultation.amount}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Invoice Summary */}
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-3">Riepilogo</h4>
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
                    <span className="font-semibold">Netto da Pagare:</span>
                    <span className="font-bold text-green-600">€{selectedInvoice.netAmount}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Chiudi
            </Button>
            <Button onClick={() => handleDownloadInvoice(selectedInvoice?.id)}>
              <Download className="mr-2 h-4 w-4" />
              Scarica PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
