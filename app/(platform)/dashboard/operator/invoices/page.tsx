import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default async function OperatorInvoicesPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect("/login")
  }

  const { data: invoices, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("operator_id", user.id)
    .order("issue_date", { ascending: false })

  if (error) console.error("Error fetching invoices:", error)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Le Tue Fatture</h1>
        <p className="text-muted-foreground">Archivio di tutte le fatture emesse per i tuoi pagamenti.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cronologia Fatture</CardTitle>
          <CardDescription>Scarica le tue fatture in formato PDF.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Numero Fattura</TableHead>
                <TableHead>Data Emissione</TableHead>
                <TableHead className="text-right">Importo</TableHead>
                <TableHead className="text-center">Stato</TableHead>
                <TableHead className="text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices && invoices.length > 0 ? (
                invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                    <TableCell>{formatDate(invoice.issue_date)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(invoice.amount)}</TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={invoice.status === "paid" ? "default" : "destructive"}
                        className={invoice.status === "paid" ? "bg-green-100 text-green-800" : ""}
                      >
                        {invoice.status === "paid" ? "Pagata" : "Da Pagare"}
                      </Badge>
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
