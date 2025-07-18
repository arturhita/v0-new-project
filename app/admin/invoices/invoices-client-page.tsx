"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CreateInvoiceModal } from "@/components/create-invoice-modal"

type Invoice = {
  id: string
  invoice_number: string | null
  amount: number | null
  status: string | null
  due_date: string | null
  client: { email: string | null } | null
  operator: { email: string | null } | null
}

type User = {
  id: string
  email: string | undefined
  type: "client" | "operator"
}

interface InvoicesClientPageProps {
  initialInvoices: Invoice[]
  users: User[]
}

export default function InvoicesClientPage({ initialInvoices, users }: InvoicesClientPageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const getStatusVariant = (status: string | null): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "paid":
        return "default"
      case "pending":
        return "secondary"
      case "overdue":
        return "destructive"
      case "draft":
        return "outline"
      default:
        return "secondary"
    }
  }

  return (
    <>
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Gestione Fatture</h1>
          <Button onClick={() => setIsModalOpen(true)}>Crea Fattura</Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Elenco Fatture</CardTitle>
            <CardDescription>{initialInvoices.length} fatture trovate.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Numero</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Operatore</TableHead>
                  <TableHead className="text-right">Importo</TableHead>
                  <TableHead>Stato</TableHead>
                  <TableHead>Scadenza</TableHead>
                  <TableHead className="text-center">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {initialInvoices.length > 0 ? (
                  initialInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.invoice_number || "N/A"}</TableCell>
                      <TableCell>{invoice.client?.email || "N/A"}</TableCell>
                      <TableCell>{invoice.operator?.email || "N/A"}</TableCell>
                      <TableCell className="text-right">€{(invoice.amount || 0).toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={getStatusVariant(invoice.status)}
                          className={invoice.status === "paid" ? "bg-green-100 text-green-800 hover:bg-green-200" : ""}
                        >
                          {invoice.status || "sconosciuto"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString("it-IT") : "N/A"}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button variant="outline" size="sm">
                          Dettagli
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      Nessuna fattura trovata.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      <CreateInvoiceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} users={users} />
    </>
  )
}
