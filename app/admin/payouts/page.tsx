import { getPayoutRequests } from "@/lib/actions/payouts.actions"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { it } from "date-fns/locale"
import { PayoutActions } from "./payout-actions"

export default async function PayoutsPage() {
  const { data: requests, error } = await getPayoutRequests()

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "secondary"
      case "approved":
        return "default"
      case "rejected":
        return "destructive"
      default:
        return "outline"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Richieste di Pagamento</CardTitle>
        <CardDescription>Approva o rifiuta le richieste di pagamento inviate dagli operatori.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Operatore</TableHead>
              <TableHead>Importo</TableHead>
              <TableHead>Data Richiesta</TableHead>
              <TableHead>Stato</TableHead>
              <TableHead className="text-right">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests && requests.length > 0 ? (
              requests.map((req) => (
                <TableRow key={req.id}>
                  <TableCell>
                    <div className="font-medium">{req.operator?.full_name ?? "N/D"}</div>
                    <div className="text-sm text-muted-foreground">{req.operator?.email ?? ""}</div>
                  </TableCell>
                  <TableCell>€{req.amount.toFixed(2)}</TableCell>
                  <TableCell>{format(new Date(req.created_at), "dd/MM/yyyy HH:mm", { locale: it })}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(req.status)}>{req.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <PayoutActions requestId={req.id} currentStatus={req.status} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
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
