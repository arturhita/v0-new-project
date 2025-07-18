"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { CreateInvoiceModal } from "@/components/create-invoice-modal"
import type { getInvoices } from "@/lib/actions/invoice.actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Invoice = Awaited<ReturnType<typeof getInvoices>>[0]

interface InvoicesClientPageProps {
  initialInvoices: Invoice[]
}

const InvoicesClientPage = ({ initialInvoices }: InvoicesClientPageProps) => {
  const [invoices, setInvoices] = useState(initialInvoices)

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Fatture</h1>
        <CreateInvoiceModal>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Crea Fattura
          </Button>
        </CreateInvoiceModal>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Elenco Fatture</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Numero</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Importo</TableHead>
                <TableHead>Data</TableHead>
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
                    <TableCell>{new Date(invoice.created_at).toLocaleDateString("it-IT")}</TableCell>
                    <TableCell>
                      <Badge variant={invoice.status === "paid" ? "default" : "destructive"}>{invoice.status}</Badge>
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
        </CardContent>
      </Card>
    </div>
  )
}

export default InvoicesClientPage
