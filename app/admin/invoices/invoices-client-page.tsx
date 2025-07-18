"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CreateInvoiceModal } from "@/components/create-invoice-modal"
import { updateInvoiceStatus } from "@/lib/actions/invoice.actions"
import { useToast } from "@/components/ui/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"

export default function InvoicesClientPage({ invoices }: { invoices: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { toast } = useToast()

  const handleStatusChange = async (invoiceId: string, status: "pending" | "paid" | "cancelled") => {
    const result = await updateInvoiceStatus(invoiceId, status)
    if (result.success) {
      toast({ title: "Stato aggiornato" })
    } else {
      toast({ title: "Errore", description: result.message, variant: "destructive" })
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setIsModalOpen(true)}>Crea Nuova Fattura</Button>
      </div>
      <CreateInvoiceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Numero</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Operatore</TableHead>
            <TableHead>Importo</TableHead>
            <TableHead>Data Scadenza</TableHead>
            <TableHead>Stato</TableHead>
            <TableHead className="text-right">Azioni</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell className="font-mono">{invoice.invoice_number}</TableCell>
              <TableCell>{invoice.client?.full_name ?? "N/A"}</TableCell>
              <TableCell>{invoice.operator?.full_name ?? "N/A"}</TableCell>
              <TableCell>€{invoice.amount.toFixed(2)}</TableCell>
              <TableCell>{new Date(invoice.due_date).toLocaleDateString("it-IT")}</TableCell>
              <TableCell>
                <Badge className={getStatusVariant(invoice.status)}>{invoice.status}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleStatusChange(invoice.id, "paid")}>
                      Segna come Pagata
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange(invoice.id, "cancelled")}>
                      Annulla
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  )
}
