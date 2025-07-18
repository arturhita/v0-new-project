import { getCommissionRequests } from "@/lib/actions/commission.actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CommissionRequestActions } from "./commission-request-actions"
import { format } from "date-fns"
import { it } from "date-fns/locale"

export default async function CommissionRequestsPage() {
  const { data: requests, error } = await getCommissionRequests()

  if (error) {
    return <div className="text-red-500 p-4">Errore: {error}</div>
  }
  if (!requests) {
    return <div className="p-4">Nessuna richiesta di commissione trovata.</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Richieste Aumento Commissione</h1>
      <Card>
        <CardHeader>
          <CardTitle>Richieste in Attesa</CardTitle>
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
                <TableHead>Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.length > 0 ? (
                requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>{request.profiles?.full_name || "N/A"}</TableCell>
                    <TableCell>{request.current_commission}%</TableCell>
                    <TableCell className="font-bold">{request.requested_commission}%</TableCell>
                    <TableCell>{format(new Date(request.created_at), "dd MMM yyyy", { locale: it })}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          request.status === "approved"
                            ? "success"
                            : request.status === "rejected"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {request.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <CommissionRequestActions request={request} />
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
