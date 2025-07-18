"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CreateInvoiceModal } from "@/components/create-invoice-modal"
import type { InvoiceWithDetails } from "@/lib/actions/invoice.actions"
import { format } from "date-fns"
import { it } from "date-fns/locale"

type InvoicesClientPageProps = {
  invoices: InvoiceWithDetails[]
}

export default function InvoicesClientPage({ invoices }: InvoicesClientPageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "paid":
        return "success"
      case "pending":
        return "secondary"
      case "overdue":
        return "destructive"
      default:
        return "default"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gestione Fatture</h1>
        <Button onClick={() => setIsModalOpen(true)}>Crea Nuova Fattura</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Elenco Fatture</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID Fattura</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Importo</TableHead>
                <TableHead>Data Emissione</TableHead>
                <TableHead>Data Scadenza</TableHead>
                <TableHead>Stato</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.length > 0 ? (
                invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                    <TableCell>{invoice.client?.full_name || "N/A"}</TableCell>
                    <TableCell>€{invoice.amount.toFixed(2)}</TableCell>
                    <TableCell>{format(new Date(invoice.issue_date), "dd MMM yyyy", { locale: it })}</TableCell>
                    <TableCell>{format(new Date(invoice.due_date), "dd MMM yyyy", { locale: it })}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(invoice.status)}>{invoice.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Nessuna fattura trovata.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <CreateInvoiceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}
