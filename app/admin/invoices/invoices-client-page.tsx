"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, FileText, MoreHorizontal } from "lucide-react"
import { CreateInvoiceModal } from "@/components/create-invoice-modal"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { updateInvoiceStatus } from "@/lib/actions/invoice.actions"

type Invoice = {
  id: string
  invoice_number: string | null
  amount: number | null
  status: string | null
  due_date: string | null
  client: { full_name: string } | null
  operator: { full_name: string } | null
}

type Recipient = {
  id: string
  name: string
  type: "client" | "operator"
}

interface InvoicesClientPageProps {
  initialInvoices: Invoice[]
  recipients: Recipient[]
}

export default function InvoicesClientPage({ initialInvoices, recipients }: InvoicesClientPageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { toast } = useToast()

  const handleInvoiceCreated = () => {
    window.location.reload()
  }

  const handleStatusChange = async (invoiceId: string, status: "paid" | "pending" | "cancelled") => {
    const result = await updateInvoiceStatus(invoiceId, status)
    if (result.success) {
      toast({ title: "Stato aggiornato", description: "Lo stato della fattura è stato modificato." })
      window.location.reload() // Ricarica per vedere il cambiamento
    } else {
      toast({ title: "Errore", description: result.error, variant: "destructive" })
    }
  }

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Pagata</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">In Attesa</Badge>
      case "cancelled":
        return <Badge variant="destructive">Annullata</Badge>
      default:
        return <Badge variant="secondary">Bozza</Badge>
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">Gestione Fatture</h1>
          <p className="text-slate-600">Crea e monitora le fatture per clienti e operatori.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-sky-600 hover:bg-sky-700">
          <PlusCircle className="h-4 w-4 mr-2" />
          Crea Fattura
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-sky-600" />
            Elenco Fatture
          </CardTitle>
          <CardDescription>Visualizza tutte le fatture generate sulla piattaforma.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Numero</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Operatore</TableHead>
                <TableHead className="text-right">Importo</TableHead>
                <TableHead>Scadenza</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead className="text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialInvoices.length > 0 ? (
                initialInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoice_number || "N/D"}</TableCell>
                    <TableCell>{invoice.client?.full_name || "N/A"}</TableCell>
                    <TableCell>{invoice.operator?.full_name || "N/A"}</TableCell>
                    <TableCell className="text-right">€{invoice.amount?.toFixed(2)}</TableCell>
                    <TableCell>
                      {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString("it-IT") : "N/D"}
                    </TableCell>
                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleStatusChange(invoice.id, "paid")}>
                            Segna come Pagata
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(invoice.id, "pending")}>
                            Segna come In Attesa
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(invoice.id, "cancelled")}>
                            Annulla Fattura
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    Nessuna fattura trovata.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <CreateInvoiceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onInvoiceCreated={handleInvoiceCreated}
        recipients={recipients}
      />
    </div>
  )
}
