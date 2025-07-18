import { getInvoicesWithDetails } from "@/lib/actions/invoice.actions"
import InvoicesClientPage from "./invoices-client-page"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { it } from "date-fns/locale"

export default async function InvoicesPage() {
  const invoices = await getInvoicesWithDetails()

  const getStatusVariant = (status: string | null) => {
    switch (status) {
      case "paid":
        return "default"
      case "pending":
        return "secondary"
      case "overdue":
        return "destructive"
      default:
        return "outline"
    }
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestione Fatture</h1>
          <p className="text-muted-foreground">Visualizza e crea fatture per clienti e operatori.</p>
        </div>
        <InvoicesClientPage invoices={invoices} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Elenco Fatture</CardTitle>
          <CardDescription>Tutte le fatture generate sulla piattaforma.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Numero</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Importo</TableHead>
                <TableHead>Data Emissione</TableHead>
                <TableHead>Stato</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.length > 0 ? (
                invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoice_number || "N/D"}</TableCell>
                    <TableCell>{invoice.client_name || "N/D"}</TableCell>
                    <TableCell>€{invoice.amount.toFixed(2)}</TableCell>
                    <TableCell>{format(new Date(invoice.issue_date), "dd MMM yyyy", { locale: it })}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(invoice.status)}>{invoice.status || "N/D"}</Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
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
