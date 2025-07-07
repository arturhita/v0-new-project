import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getOperatorInvoices } from "@/lib/actions/operator.actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default async function OperatorInvoicesPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const invoices = await getOperatorInvoices(user.id)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Le tue Fatture</CardTitle>
        <CardDescription>Qui trovi l'elenco di tutte le fatture emesse per i tuoi pagamenti.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Numero Fattura</TableHead>
              <TableHead>Data Emissione</TableHead>
              <TableHead>Importo</TableHead>
              <TableHead>Stato</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.length > 0 ? (
              invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                  <TableCell>{new Date(invoice.issue_date).toLocaleDateString()}</TableCell>
                  <TableCell>€{invoice.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={invoice.status === "paid" ? "default" : "secondary"}>{invoice.status}</Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  Nessuna fattura trovata.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
