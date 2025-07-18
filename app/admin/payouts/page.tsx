import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { getPayoutRequests } from "@/lib/actions/payouts.actions"
import PayoutActions from "./payout-actions"
import { format } from "date-fns"

export default async function PayoutsPage() {
  const { data: payouts, error } = await getPayoutRequests()

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>
  }

  if (!payouts || payouts.length === 0) {
    return (
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>Gestione Pagamenti</CardTitle>
            <CardDescription>Nessuna richiesta di pagamento trovata.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>Gestione Pagamenti</CardTitle>
          <CardDescription>Visualizza e processa le richieste di pagamento degli operatori.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Operatore</TableHead>
                <TableHead>Importo</TableHead>
                <TableHead>Dettagli Pagamento</TableHead>
                <TableHead>Data Richiesta</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead className="text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payouts.map((payout) => (
                <TableRow key={payout.id}>
                  <TableCell>{payout.operator.full_name}</TableCell>
                  <TableCell className="font-bold">€{payout.amount.toFixed(2)}</TableCell>
                  <TableCell className="text-xs">
                    {payout.payment_details ? (
                      <>
                        <div>Metodo: {payout.payment_details.method}</div>
                        <div>{payout.payment_details.email || payout.payment_details.iban}</div>
                      </>
                    ) : (
                      "N/D"
                    )}
                  </TableCell>
                  <TableCell>{format(new Date(payout.created_at), "dd/MM/yyyy HH:mm")}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        payout.status === "pending"
                          ? "secondary"
                          : payout.status === "paid"
                            ? "default"
                            : payout.status === "rejected"
                              ? "destructive"
                              : "outline"
                      }
                    >
                      {payout.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <PayoutActions payoutId={payout.id} currentStatus={payout.status} />
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
