import { getPayoutRequests } from "@/lib/actions/payouts.actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { PayoutActions } from "./payout-actions"
import { format } from "date-fns"

export default async function PayoutsPage() {
  const requests = await getPayoutRequests()

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Richieste di Pagamento</h1>
      <Card>
        <CardHeader>
          <CardTitle>Elenco Richieste</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Operatore</TableHead>
                <TableHead>Importo</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead>Data Richiesta</TableHead>
                <TableHead>Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((req) => (
                <TableRow key={req.id}>
                  <TableCell>{req.profiles?.username || "N/A"}</TableCell>
                  <TableCell>€{req.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={req.status === "completed" ? "default" : "secondary"}>{req.status}</Badge>
                  </TableCell>
                  <TableCell>{format(new Date(req.created_at), "dd/MM/yyyy HH:mm")}</TableCell>
                  <TableCell>
                    <PayoutActions requestId={req.id} currentStatus={req.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
