import { getAllInvoices } from "@/lib/actions/invoice.actions"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import CreateInvoiceModal from "@/components/create-invoice-modal"
import { Badge } from "@/components/ui/badge"

export default async function InvoicesPage() {
  const invoices = await getAllInvoices()

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "paid":
        return "success"
      case "pending":
        return "default"
      case "overdue":
        return "destructive"
      default:
        return "secondary"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gestione Fatture</h1>
        <CreateInvoiceModal />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Elenco Fatture</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Numero Fattura</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Operatore</TableHead>
                <TableHead>Importo</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead>Data Scadenza</TableHead>
                <TableHead>Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.length > 0 ? (
                invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                    <TableCell>{invoice.user_email}</TableCell>
                    <TableCell>{invoice.operator_email}</TableCell>
                    <TableCell>€{invoice.amount}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(invoice.status)}>{invoice.status}</Badge>
                    </TableCell>
                    <TableCell>{new Date(invoice.due_date).toLocaleDateString()}</TableCell>
                    <TableCell>
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
  )
}
