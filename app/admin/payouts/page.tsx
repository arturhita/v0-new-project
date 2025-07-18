import { getPayoutRequests } from "@/lib/actions/payouts.actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { PayoutActions } from "./payout-actions"
import { unstable_noStore as noStore } from "next/cache"

export default async function PayoutsPage() {
  noStore()
  const requests = await getPayoutRequests()

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Richieste di Pagamento</h1>
      <Card>
        <CardHeader>
          <CardTitle>Storico Richieste</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Operatore</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Importo</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead className="text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.length > 0 ? (
                requests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell>{req.profiles?.full_name ?? "N/A"}</TableCell>
                    <TableCell>{req.profiles?.email ?? "N/A"}</TableCell>
                    <TableCell>€{req.amount.toFixed(2)}</TableCell>
                    <TableCell>{new Date(req.created_at).toLocaleDateString("it-IT")}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          req.status === "completed"
                            ? "default"
                            : req.status === "rejected"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {req.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <PayoutActions requestId={req.id} currentStatus={req.status} />
                    </TableCell>
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
    </div>
  )
}
