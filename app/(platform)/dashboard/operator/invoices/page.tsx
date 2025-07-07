import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getOperatorInvoices } from "@/lib/actions/operator.actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

export default async function InvoicesPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect("/login")
  }

  const invoices = await getOperatorInvoices(user.id)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Fatture e Ricevute</h1>
        <p className="text-gray-400">Scarica le tue fatture per i pagamenti ricevuti.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Le Tue Fatture</CardTitle>
          <CardDescription>Qui troverai le fatture generate per ogni pagamento che hai ricevuto.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Numero Fattura</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Importo</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead className="text-right">Azione</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.length > 0 ? (
                invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.id}</TableCell>
                    <TableCell>{invoice.date}</TableCell>
                    <TableCell>€{invoice.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={invoice.status === "paid" ? "success" : "warning"}>{invoice.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" disabled>
                        <Download className="mr-2 h-4 w-4" />
                        Scarica
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
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
