"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { it } from "date-fns/locale"
import { CreateInvoiceModal } from "@/components/create-invoice-modal"

type Invoice = {
  id: string
  invoice_number: string
  amount: number
  status: string
  due_date: string
  created_at: string
  client: { full_name: string | null } | null
}

interface InvoicesClientPageProps {
  initialInvoices: Invoice[]
}

const InvoicesClientPage = ({ initialInvoices }: InvoicesClientPageProps) => {
  const [invoices, setInvoices] = useState(initialInvoices)

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case "paid":
        return "success"
      case "pending":
        return "secondary"
      case "overdue":
        return "destructive"
      default:
        return "outline"
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Gestione Fatture</h1>
        <CreateInvoiceModal />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Numero Fattura</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Importo</TableHead>
              <TableHead>Data Scadenza</TableHead>
              <TableHead>Stato</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.length > 0 ? (
              invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                  <TableCell>{invoice.client?.full_name ?? "N/A"}</TableCell>
                  <TableCell>€{Number(invoice.amount).toFixed(2)}</TableCell>
                  <TableCell>{format(new Date(invoice.due_date), "d MMM yyyy", { locale: it })}</TableCell>
                  <TableCell>
                    <Badge variant={getBadgeVariant(invoice.status)}>{invoice.status}</Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  Nessuna fattura trovata.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default InvoicesClientPage
