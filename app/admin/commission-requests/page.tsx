import { getCommissionRequests } from "@/lib/actions/commission.actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CommissionRequestActions } from "./commission-request-actions"
import { unstable_noStore as noStore } from "next/cache"

export default async function CommissionRequestsPage() {
  noStore()
  const requests = await getCommissionRequests()

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Richieste Aumento Commissione</h1>
      <Card>
        <CardHeader>
          <CardTitle>Richieste degli Operatori</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Operatore</TableHead>
                <TableHead>% Attuale</TableHead>
                <TableHead>% Richiesta</TableHead>
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
                    <TableCell>{req.current_rate}%</TableCell>
                    <TableCell>{req.requested_rate}%</TableCell>
                    <TableCell>{new Date(req.created_at).toLocaleDateString("it-IT")}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          req.status === "approved"
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
                      <CommissionRequestActions requestId={req.id} currentStatus={req.status} />
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
