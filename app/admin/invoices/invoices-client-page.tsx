"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CreateInvoiceModal } from "@/components/create-invoice-modal"
import type { InvoiceWithDetails } from "@/lib/actions/invoice.actions"
import { format } from "date-fns"
import { it } from "date-fns/locale"

type InvoicesClientPageProps = {
  initialInvoices: InvoiceWithDetails[]
}

const InvoicesClientPage = ({ initialInvoices }: InvoicesClientPageProps) => {
  const [invoices, setInvoices] = useState(initialInvoices)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleInvoiceCreated = (newInvoice: InvoiceWithDetails) => {
    setInvoices([newInvoice, ...invoices])
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Gestione Fatture</h1>
          <p className="text-muted-foreground">Visualizza e crea fatture per clienti e operatori.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>Crea Nuova Fattura</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Elenco Fatture</CardTitle>
          <CardDescription>Lista di tutte le fatture generate nel sistema.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID Fattura</TableHead>
                <TableHead>Utente</TableHead>
                <TableHead>Importo</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead>Data Emissione</TableHead>
                <TableHead>Data Pagamento</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.length > 0 ? (
                invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                    <TableCell>{invoice.profiles?.username ?? "Utente non trovato"}</TableCell>
                    <TableCell>€{invoice.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={invoice.status === "paid" ? "default" : "secondary"}>{invoice.status}</Badge>
                    </TableCell>
                    <TableCell>{format(new Date(invoice.issued_at), "d MMM yyyy", { locale: it })}</TableCell>
                    <TableCell>
                      {invoice.paid_at ? format(new Date(invoice.paid_at), "d MMM yyyy", { locale: it }) : "N/A"}
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

      <CreateInvoiceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onInvoiceCreated={handleInvoiceCreated}
      />
    </>
  )
}

export default InvoicesClientPage
