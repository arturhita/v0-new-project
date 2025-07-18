import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { getCommissionRequests } from "@/lib/actions/commission.actions"
import CommissionRequestActions from "./commission-request-actions"
import { format } from "date-fns"

export default async function CommissionRequestsLogPage() {
  const { data: requests, error } = await getCommissionRequests()

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>
  }

  if (!requests || requests.length === 0) {
    return (
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>Log Richieste Commissione</CardTitle>
            <CardDescription>Nessuna richiesta di modifica commissione trovata.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>Log Richieste Commissione</CardTitle>
          <CardDescription>
            Visualizza e gestisci le richieste di modifica della commissione da parte degli operatori.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Operatore</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Tasso Attuale</TableHead>
                <TableHead>Tasso Richiesto</TableHead>
                <TableHead>Data Richiesta</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead className="text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((req) => (
                <TableRow key={req.id}>
                  <TableCell>{req.operator.full_name}</TableCell>
                  <TableCell>{req.operator.email}</TableCell>
                  <TableCell>{req.current_rate}%</TableCell>
                  <TableCell className="font-bold">{req.requested_rate}%</TableCell>
                  <TableCell>{format(new Date(req.created_at), "dd/MM/yyyy HH:mm")}</TableCell>
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
                    {req.status === "pending" && <CommissionRequestActions requestId={req.id} />}
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
