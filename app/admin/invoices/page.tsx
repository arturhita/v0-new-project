"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileText, Download, Eye, Plus, Search } from "lucide-react"
import CreateInvoiceModal from "@/components/create-invoice-modal"

interface Invoice {
  id: string
  number: string
  operatorId: string
  operatorName: string
  date: string
  dueDate: string
  status: "draft" | "sent" | "paid" | "overdue"
  amount: number
  items: InvoiceItem[]
}

interface InvoiceItem {
  id: string
  description: string
  type: "consultation" | "commission" | "deduction" | "fee"
  quantity: number
  unitPrice: number
  total: number
}

export default function ManageInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: "inv1",
      number: "INV-2024-001",
      operatorId: "op1",
      operatorName: "Stella Divina",
      date: "2024-01-15",
      dueDate: "2024-02-15",
      status: "paid",
      amount: 1250.75,
      items: [
        {
          id: "item1",
          description: "Consulenze telefoniche - Gennaio 2024",
          type: "consultation",
          quantity: 45,
          unitPrice: 25.5,
          total: 1147.5,
        },
        {
          id: "item2",
          description: "Commissione piattaforma (8%)",
          type: "commission",
          quantity: 1,
          unitPrice: -91.8,
          total: -91.8,
        },
        {
          id: "item3",
          description: "Detrazione chiamate cellulari",
          type: "deduction",
          quantity: 12,
          unitPrice: -0.3,
          total: -3.6,
        },
        {
          id: "item4",
          description: "Commissione processamento pagamenti",
          type: "fee",
          quantity: 45,
          unitPrice: -0.25,
          total: -11.25,
        },
      ],
    },
    {
      id: "inv2",
      number: "INV-2024-002",
      operatorId: "op2",
      operatorName: "Marco Astrologo",
      date: "2024-01-20",
      dueDate: "2024-02-20",
      status: "sent",
      amount: 890.4,
      items: [
        {
          id: "item5",
          description: "Consulenze chat - Gennaio 2024",
          type: "consultation",
          quantity: 32,
          unitPrice: 18.0,
          total: 576.0,
        },
        {
          id: "item6",
          description: "Consulenze telefoniche - Gennaio 2024",
          type: "consultation",
          quantity: 18,
          unitPrice: 22.0,
          total: 396.0,
        },
        {
          id: "item7",
          description: "Commissione piattaforma (12%)",
          type: "commission",
          quantity: 1,
          unitPrice: -116.64,
          total: -116.64,
        },
        {
          id: "item8",
          description: "Detrazione chiamate cellulari",
          type: "deduction",
          quantity: 8,
          unitPrice: -0.3,
          total: -2.4,
        },
        {
          id: "item9",
          description: "Commissione processamento pagamenti",
          type: "fee",
          quantity: 50,
          unitPrice: -0.25,
          total: -12.5,
        },
      ],
    },
    {
      id: "inv3",
      number: "INV-2024-003",
      operatorId: "op3",
      operatorName: "Luna Stellare",
      date: "2024-01-25",
      dueDate: "2024-02-25",
      status: "overdue",
      amount: 2150.3,
      items: [
        {
          id: "item10",
          description: "Consulenze premium - Gennaio 2024",
          type: "consultation",
          quantity: 65,
          unitPrice: 35.0,
          total: 2275.0,
        },
        {
          id: "item11",
          description: "Commissione piattaforma (5%)",
          type: "commission",
          quantity: 1,
          unitPrice: -113.75,
          total: -113.75,
        },
        {
          id: "item12",
          description: "Detrazione chiamate cellulari",
          type: "deduction",
          quantity: 15,
          unitPrice: -0.3,
          total: -4.5,
        },
        {
          id: "item13",
          description: "Commissione processamento pagamenti",
          type: "fee",
          quantity: 65,
          unitPrice: -0.25,
          total: -16.25,
        },
      ],
    },
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [showCreateModal, setShowCreateModal] = useState(false)

  const getStatusBadge = (status: Invoice["status"]) => {
    const variants = {
      draft: "secondary",
      sent: "default",
      paid: "default",
      overdue: "destructive",
    } as const

    const labels = {
      draft: "Bozza",
      sent: "Inviata",
      paid: "Pagata",
      overdue: "Scaduta",
    }

    return (
      <Badge
        variant={variants[status]}
        className={status === "paid" ? "bg-green-100 text-green-800 hover:bg-green-200" : ""}
      >
        {labels[status]}
      </Badge>
    )
  }

  const getItemTypeLabel = (type: InvoiceItem["type"]) => {
    const labels = {
      consultation: "Consulenza",
      commission: "Commissione",
      deduction: "Detrazione",
      fee: "Spesa",
    }
    return labels[type]
  }

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.operatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.number.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleViewInvoice = (invoiceId: string) => {
    console.log("Visualizza fattura:", invoiceId)
    // Implementare visualizzazione dettagliata
  }

  const handleDownloadInvoice = (invoiceId: string) => {
    console.log("Scarica fattura:", invoiceId)
    // Implementare download PDF
  }

  const handleInvoiceCreated = () => {
    // Ricarica lista fatture
    console.log("Fattura creata, ricarico lista...")
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-800">Gestione Fatture</h1>
            <p className="text-slate-600">Visualizza e gestisci le fatture degli operatori con commissioni e spese.</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="bg-sky-600 hover:bg-sky-700">
            <Plus className="h-4 w-4 mr-2" />
            Nuova Fattura
          </Button>
        </div>

        {/* Filtri e Ricerca */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Cerca fatture</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="search"
                    placeholder="Cerca per operatore o numero fattura..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="sm:w-48">
                <Label htmlFor="status-filter">Stato</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtra per stato" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tutti gli stati</SelectItem>
                    <SelectItem value="draft">Bozza</SelectItem>
                    <SelectItem value="sent">Inviata</SelectItem>
                    <SelectItem value="paid">Pagata</SelectItem>
                    <SelectItem value="overdue">Scaduta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistiche Rapide */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-slate-800">
                €{invoices.reduce((sum, inv) => sum + inv.amount, 0).toLocaleString()}
              </div>
              <p className="text-sm text-slate-600">Totale Fatture</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">
                {invoices.filter((inv) => inv.status === "paid").length}
              </div>
              <p className="text-sm text-slate-600">Fatture Pagate</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-amber-600">
                {invoices.filter((inv) => inv.status === "sent").length}
              </div>
              <p className="text-sm text-slate-600">In Attesa</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-red-600">
                {invoices.filter((inv) => inv.status === "overdue").length}
              </div>
              <p className="text-sm text-slate-600">Scadute</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabella Fatture */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-sky-600" />
              Elenco Fatture
            </CardTitle>
            <CardDescription>{filteredInvoices.length} fatture trovate</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Numero</TableHead>
                  <TableHead>Operatore</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Scadenza</TableHead>
                  <TableHead>Stato</TableHead>
                  <TableHead className="text-right">Importo</TableHead>
                  <TableHead className="text-center">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.number}</TableCell>
                    <TableCell>{invoice.operatorName}</TableCell>
                    <TableCell>{new Date(invoice.date).toLocaleDateString("it-IT")}</TableCell>
                    <TableCell>{new Date(invoice.dueDate).toLocaleDateString("it-IT")}</TableCell>
                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                    <TableCell className="text-right font-medium">
                      €{invoice.amount.toLocaleString("it-IT", { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleViewInvoice(invoice.id)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDownloadInvoice(invoice.id)}>
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Dettaglio Fattura Esempio */}
        {filteredInvoices.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Dettaglio Fattura - {filteredInvoices[0].number}</CardTitle>
              <CardDescription>Esempio di dettaglio con commissioni e spese</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrizione</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-center">Quantità</TableHead>
                    <TableHead className="text-right">Prezzo Unit.</TableHead>
                    <TableHead className="text-right">Totale</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices[0].items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{getItemTypeLabel(item.type)}</Badge>
                      </TableCell>
                      <TableCell className="text-center">{item.quantity}</TableCell>
                      <TableCell className="text-right">
                        €{item.unitPrice.toLocaleString("it-IT", { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell
                        className={`text-right font-medium ${item.total < 0 ? "text-red-600" : "text-green-600"}`}
                      >
                        €{item.total.toLocaleString("it-IT", { minimumFractionDigits: 2 })}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="border-t-2 border-slate-200">
                    <TableCell colSpan={4} className="font-semibold">
                      Totale Fattura
                    </TableCell>
                    <TableCell className="text-right font-bold text-lg">
                      €{filteredInvoices[0].amount.toLocaleString("it-IT", { minimumFractionDigits: 2 })}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal Creazione Fattura */}
      <CreateInvoiceModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onInvoiceCreated={handleInvoiceCreated}
      />
    </>
  )
}
