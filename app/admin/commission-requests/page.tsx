import { getAdminCommissionRequests } from "@/lib/actions/commission.actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import ProcessCommissionRequestForm from "./ProcessCommissionRequestForm"

export default async function AdminCommissionRequestsPage() {
  const requests = await getAdminCommissionRequests()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Richieste di Commissione Operatori</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Operatore</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Commissione Attuale</TableHead>
              <TableHead>Commissione Richiesta</TableHead>
              <TableHead>Stato</TableHead>
              <TableHead>Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((req) => (
              <TableRow key={req.id}>
                <TableCell>{req.operator.stage_name}</TableCell>
                <TableCell>{new Date(req.requested_at).toLocaleDateString()}</TableCell>
                <TableCell>{req.current_rate}%</TableCell>
                <TableCell>{req.requested_rate}%</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      req.status === "approved" ? "default" : req.status === "rejected" ? "destructive" : "secondary"
                    }
                  >
                    {req.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {req.status === "pending" && (
                    <ProcessCommissionRequestForm
                      requestId={req.id}
                      operatorId={req.operator_id}
                      newRate={req.requested_rate}
                    />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
