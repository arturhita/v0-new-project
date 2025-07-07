import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getOperatorInvoices } from "@/lib/actions/operator.actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { format } from "date-fns"

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
      <Card className="bg-gray-800 border-gray-700 text-white">
        <CardHeader>
          <CardTitle>Le Tue Fatture</CardTitle>
          <CardDescription className="text-gray-400">
            Qui troverai le fatture generate per ogni pagamento che hai ricevuto.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-b-gray-700 hover:bg-gray-800/50">
                <TableHead className="text-white">Numero Fattura</TableHead>
                <TableHead className="text-white">Data</TableHead>
                <TableHead className="text-white">Importo</TableHead>
                <TableHead className="text-white">Stato</TableHead>
                <TableHead className="text-right text-white">Azione</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.length > 0 ? (
                invoices.map((invoice) => (
                  <TableRow key={invoice.id} className="border-b-gray-700">
                    <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                    <TableCell>{format(new Date(invoice.date), "dd/MM/yyyy")}</TableCell>
                    <TableCell>€{invoice.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={invoice.status === "paid" ? "success" : "default"}>{invoice.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" disabled={!invoice.pdf_url}>
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
