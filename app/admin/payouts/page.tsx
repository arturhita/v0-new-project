import { getPayoutRequests } from "@/lib/actions/payouts.actions"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { PayoutActions } from "./payout-actions"
import { format } from "date-fns"
import { it } from "date-fns/locale"

export default async function PayoutsPage() {
  const { data: requests, error } = await getPayoutRequests()

  if (error) {
    return <div className="p-8 text-red-500">{error}</div>
  }

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case "approved":
        return "success"
      case "rejected":
        return "destructive"
      case "pending":
      default:
        return "secondary"
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Richieste di Pagamento</h1>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Operatore</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-right">Importo</TableHead>
              <TableHead>Data Richiesta</TableHead>
              <TableHead>Stato</TableHead>
              <TableHead className="text-right">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests && requests.length > 0 ? (
              requests.map((req) => (
                <TableRow key={req.id}>
                  <TableCell className="font-medium">{req.profiles?.full_name ?? "N/A"}</TableCell>
                  <TableCell>{req.profiles?.email ?? "N/A"}</TableCell>
                  <TableCell className="text-right">€{Number(req.amount).toFixed(2)}</TableCell>
                  <TableCell>{format(new Date(req.created_at), "d MMM yyyy, HH:mm", { locale: it })}</TableCell>
                  <TableCell>
                    <Badge variant={getBadgeVariant(req.status)}>{req.status}</Badge>
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
      </div>
    </div>
  )
}
