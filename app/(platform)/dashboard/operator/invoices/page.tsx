import { getOperatorInvoices } from "@/lib/actions/operator.actions"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { it } from "date-fns/locale"

export default async function OperatorInvoicesPage() {
  const { data: invoices, error } = await getOperatorInvoices()

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Errore</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    )
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(amount)
  const formatDate = (date: string) => format(new Date(date), "dd MMMM yyyy", { locale: it })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Le tue Fatture</h1>
        <p className="text-gray-600">Visualizza e scarica le fatture relative ai tuoi pagamenti.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Storico Fatture</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Numero Fattura</TableHead>
                <TableHead>Data Emissione</TableHead>
                <TableHead>Importo</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead>Azione</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices && invoices.length > 0 ? (
                invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>{invoice.invoice_number}</TableCell>
                    <TableCell>{formatDate(invoice.issue_date)}</TableCell>
                    <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                    <TableCell>
                      <Badge variant={invoice.status === "paid" ? "default" : "secondary"}>{invoice.status}</Badge>
                    </TableCell>
                    <TableCell>
                      {invoice.pdf_url ? (
                        <a
                          href={invoice.pdf_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Scarica
                        </a>
                      ) : (
                        "N/D"
                      )}
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
