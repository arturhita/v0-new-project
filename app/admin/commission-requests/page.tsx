import { getCommissionRequests } from "@/lib/actions/commission.actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CommissionRequestActions } from "./commission-request-actions"
import { format } from "date-fns"

export default async function CommissionRequestsPage() {
  const requests = await getCommissionRequests()

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Richieste Aumento Commissione</h1>
      <Card>
        <CardHeader>
          <CardTitle>Elenco Richieste</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Operatore</TableHead>
                <TableHead>Attuale</TableHead>
                <TableHead>Richiesta</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((req) => (
                <TableRow key={req.id}>
                  <TableCell>{req.profiles?.username || "N/A"}</TableCell>
                  <TableCell>{req.current_rate}%</TableCell>
                  <TableCell>{req.requested_rate}%</TableCell>
                  <TableCell>
                    <Badge variant={req.status === "approved" ? "default" : "secondary"}>{req.status}</Badge>
                  </TableCell>
                  <TableCell>{format(new Date(req.created_at), "dd/MM/yyyy")}</TableCell>
                  <TableCell>
                    <CommissionRequestActions requestId={req.id} currentStatus={req.status} />
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
