import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { getCommissionRequests } from "@/lib/actions/commission.actions"
import { CommissionRequestActions } from "./commission-request-actions"
import { format } from "date-fns"
import { Percent } from "lucide-react"

export default async function CommissionRequestsPage() {
  const { data: requests, error } = await getCommissionRequests()

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Approvata</Badge>
      case "rejected":
        return <Badge variant="destructive">Rifiutata</Badge>
      case "pending":
      default:
        return <Badge variant="secondary">In Attesa</Badge>
    }
  }

  return (
    <div className="p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="h-5 w-5 text-sky-600" />
            Richieste Aumento Commissione
          </CardTitle>
          <CardDescription>
            Visualizza e gestisci le richieste di aumento percentuale inviate dagli operatori.
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
                requests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell className="font-medium">{req.operator?.full_name || "N/D"}</TableCell>
                    <TableCell>{req.current_commission}%</TableCell>
                    <TableCell className="font-bold text-green-600">{req.requested_commission}%</TableCell>
                    <TableCell>{format(new Date(req.created_at), "dd/MM/yyyy HH:mm")}</TableCell>
                    <TableCell>{getStatusBadge(req.status)}</TableCell>
                    <TableCell className="text-right">
                      <CommissionRequestActions request={req} />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
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
