"use client"

import { useState } from "react"
import type { User } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, FileText } from 'lucide-react'
import CreateInvoiceModal from "@/components/create-invoice-modal"

type Invoice = {
  id: string
  invoice_number: string | null
  amount: number | null
  status: string | null
  due_date: string | null
  clientName: string
  operatorName: string
}

interface InvoicesClientPageProps {
  initialInvoices: Invoice[]
}

export default function InvoicesClientPage({ initialInvoices }: InvoicesClientPageProps) {
  const [invoices, setInvoices] = useState(initialInvoices)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [users, setUsers] = useState<User[]>([]) // Da popolare con una chiamata API

  // TODO: Caricare utenti (clienti e operatori) per il modal di creazione
  // useEffect(() => {
  //   async function fetchUsers() {
  //     // Sostituire con la tua server action per prendere gli utenti
  //     // const fetchedUsers = await getUsersForInvoicing();
  //     // setUsers(fetchedUsers);
  //   }
  //   fetchUsers();
  // }, []);

  const handleInvoiceCreated = (newInvoice: any) => {
    // Per ora, ricarichiamo la pagina per vedere la nuova fattura.
    // In futuro si potrebbe aggiornare lo stato locale.
    window.location.reload()
  }

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "paid":
        return <Badge variant="success">Pagata</Badge>
      case "sent":
        return <Badge variant="default">Inviata</Badge>
      case "overdue":
        return <Badge variant="destructive">Scaduta</Badge>
      case "draft":
      default:
        return <Badge variant="secondary">Bozza</Badge>
    }
  }

  return (
    <div className="space-y-6">
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.length > 0 ? (
                invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoice_number || "N/D"}</TableCell>
                    <TableCell>{invoice.clientName}</TableCell>
                    <TableCell>{invoice.operatorName}</TableCell>
                    <TableCell className="text-right">€{invoice.amount?.toFixed(2)}</TableCell>
                    <TableCell>{invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : "N/D"}</TableCell>
                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
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
        users={users} // Passa la lista di utenti
      />
    </div>
  )
}
