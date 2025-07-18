import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { getAdminTransactions } from "@/lib/actions/payments.actions"
import { format } from "date-fns"
import { it } from "date-fns/locale"

export default async function AdminPaymentsPage() {
  const transactions = await getAdminTransactions()

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "succeeded":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "secondary"
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Storico Transazioni</CardTitle>
          <CardDescription>
            Visualizza tutte le transazioni di pagamento registrate nel sistema tramite Stripe.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Utente</TableHead>
                <TableHead>Importo</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead>ID Transazione Stripe</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length > 0 ? (
                transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>{format(new Date(tx.created_at), "d MMM yyyy, HH:mm", { locale: it })}</TableCell>
                    <TableCell>
                      <div className="font-medium">{tx.user?.full_name || "N/D"}</div>
                      <div className="text-sm text-muted-foreground">{tx.user?.email}</div>
                    </TableCell>
                    <TableCell>
                      {new Intl.NumberFormat("it-IT", { style: "currency", currency: tx.currency }).format(tx.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusVariant(tx.status)}>{tx.status}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{tx.stripe_payment_intent_id}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">
                    Nessuna transazione trovata.
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
