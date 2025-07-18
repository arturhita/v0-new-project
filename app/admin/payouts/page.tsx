import { getPayoutRequests } from "@/lib/actions/payouts.actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { PayoutActions } from "./payout-actions"
import { unstable_noStore as noStore } from "next/cache"

export default async function PayoutsPage() {
  noStore()
  const requests = await getPayoutRequests()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Richieste di Pagamento</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Operatore</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Importo</TableHead>
              <TableHead>Data Richiesta</TableHead>
              <TableHead>Stato</TableHead>
              <TableHead>Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.length > 0 ? (
              requests.map((req) => (
                <TableRow key={req.id}>
                  <TableCell>{req.profiles?.full_name ?? "N/A"}</TableCell>
                  <TableCell>{req.profiles?.email ?? "N/A"}</TableCell>
                  <TableCell>{formatCurrency(req.amount)}</TableCell>
                  <TableCell>{formatDate(req.created_at)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        req.status === "completed" ? "default" : req.status === "rejected" ? "destructive" : "secondary"
                      }
                    >
                      {req.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{req.status === "pending" && <PayoutActions requestId={req.id} />}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  Nessuna richiesta di pagamento trovata.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
