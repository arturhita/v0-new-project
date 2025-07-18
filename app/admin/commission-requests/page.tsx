import { getCommissionRequests } from "@/lib/actions/commission.actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CommissionRequestActions } from "./commission-request-actions"
import { unstable_noStore as noStore } from "next/cache"

export default async function CommissionRequestsPage() {
  noStore()
  const requests = await getCommissionRequests()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Richieste Aumento Commissione</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Operatore</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Nuova % Richiesta</TableHead>
              <TableHead>Data Richiesta</TableHead>
              <TableHead>Stato</TableHead>
              <TableHead>Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.length > 0 ? (
              requests.map((req) => (
                <TableRow key={req.id}>
                  <TableCell>{req.profiles?.full_name ?? "N/A"}</TableCell>
                  <TableCell>{req.profiles?.email ?? "N/A"}</TableCell>
                  <TableCell>{req.new_rate}%</TableCell>
                  <TableCell>{formatDate(req.created_at)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        req.status === "approved" ? "default" : req.status === "rejected" ? "destructive" : "secondary"
                      }
                    >
                      {req.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{req.status === "pending" && <CommissionRequestActions requestId={req.id} />}</TableCell>
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
  )
}
