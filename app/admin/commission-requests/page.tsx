import { getCommissionIncreaseRequests } from "@/lib/actions/commission.actions"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns"
import { it } from "date-fns/locale"
import { CommissionRequestActions } from "./commission-request-actions"

export default async function CommissionRequestsPage() {
  const { data: requests, error } = await getCommissionIncreaseRequests()

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Richieste Aumento Commissione</CardTitle>
        <CardDescription>
          Visualizza e gestisci le richieste di aumento della percentuale di commissione da parte degli operatori.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Operatore</TableHead>
              <TableHead>Commissione Attuale</TableHead>
              <TableHead>Commissione Richiesta</TableHead>
              <TableHead>Data Richiesta</TableHead>
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
                  <TableCell>{req.current_rate}%</TableCell>
                  <TableCell className="font-bold">{req.requested_rate}%</TableCell>
                  <TableCell>{format(new Date(req.created_at), "dd/MM/yyyy", { locale: it })}</TableCell>
                  <TableCell className="text-right">
                    <CommissionRequestActions request={req} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Nessuna richiesta di aumento commissione trovata.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
