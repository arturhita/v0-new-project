import { getCommissionIncreaseRequests } from "@/lib/actions/commission.actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { it } from "date-fns/locale"
import { CommissionRequestActions } from "./commission-request-actions"

export default async function CommissionRequestsPage() {
  const requests = await getCommissionIncreaseRequests()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Richieste Aumento Commissione</h1>
        <p className="text-muted-foreground">
          Approva o rifiuta le richieste degli operatori per una commissione migliore.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Richieste in Sospeso</CardTitle>
          <CardDescription>
            Lista di tutte le richieste di aumento commissione da parte degli operatori.
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
                <TableHead>Stato</TableHead>
                <TableHead className="text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests && requests.length > 0 ? (
                requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.profiles?.username ?? "N/A"}</TableCell>
                    <TableCell>{request.current_commission}%</TableCell>
                    <TableCell>{request.requested_commission}%</TableCell>
                    <TableCell>{format(new Date(request.created_at), "d MMM yyyy", { locale: it })}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          request.status === "approved"
                            ? "default"
                            : request.status === "rejected"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {request.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {request.status === "pending" && <CommissionRequestActions requestId={request.id} />}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Nessuna richiesta trovata.
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
