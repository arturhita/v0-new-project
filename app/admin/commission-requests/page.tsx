import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { getCommissionRequests } from "@/lib/actions/commission.actions"
import { format } from "date-fns"
import { it } from "date-fns/locale"
import { CommissionRequestActions } from "./commission-request-actions"

export default async function CommissionRequestsPage() {
  const { data: requests, error } = await getCommissionRequests()

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>
  }

  return (
    <div className="p-4 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Richieste Aumento Commissione</CardTitle>
          <CardDescription>
            Visualizza e gestisci le richieste di modifica della commissione da parte degli operatori.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!requests || requests.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nessuna richiesta trovata.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Operatore</TableHead>
                  <TableHead>Commissione Attuale</TableHead>
                  <TableHead>Commissione Richiesta</TableHead>
                  <TableHead>Data Richiesta</TableHead>
                  <TableHead>Stato</TableHead>
                  <TableHead className="text-right">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell>{req.profiles?.full_name ?? "N/D"}</TableCell>
                    <TableCell>{req.current_commission}%</TableCell>
                    <TableCell className="font-bold">{req.requested_commission}%</TableCell>
                    <TableCell>{format(new Date(req.created_at), "dd/MM/yyyy", { locale: it })}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          req.status === "pending" ? "secondary" : req.status === "approved" ? "default" : "destructive"
                        }
                      >
                        {req.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <CommissionRequestActions request={req as any} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
