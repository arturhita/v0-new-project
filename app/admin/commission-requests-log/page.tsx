import { getCommissionRequests } from "@/lib/actions/commission.actions"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileText } from "lucide-react"
import CommissionRequestActions from "./commission-request-actions"
import { Badge } from "@/components/ui/badge"

export const revalidate = 0

const getStatusBadge = (status: string) => {
  switch (status) {
    case "pending":
      return (
        <Badge variant="outline" className="border-yellow-500 text-yellow-600">
          In Attesa
        </Badge>
      )
    case "approved":
      return (
        <Badge variant="default" className="bg-emerald-500 text-white">
          Approvata
        </Badge>
      )
    case "rejected":
      return <Badge variant="destructive">Rifiutata</Badge>
    default:
      return <Badge>Sconosciuto</Badge>
  }
}

export default async function ManageCommissionRequestsPage() {
  const requests = await getCommissionRequests()

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-slate-800">Richieste Modifica Commissione</h1>
      <CardDescription className="text-slate-500 -mt-4">
        Valuta le richieste di modifica della percentuale di commissione inviate dagli operatori.
      </CardDescription>

      <Card className="shadow-xl rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2 text-[hsl(var(--primary-medium))]" />
            Richieste Pendenti e Storico
          </CardTitle>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <p className="text-center text-slate-500 py-4">Nessuna richiesta di modifica commissione presente.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Operatore</TableHead>
                  <TableHead className="text-center">Comm. Attuale</TableHead>
                  <TableHead className="text-center">Comm. Richiesta</TableHead>
                  <TableHead>Data Richiesta</TableHead>
                  <TableHead>Stato</TableHead>
                  <TableHead className="text-right">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((req: any) => (
                  <TableRow key={req.id}>
                    <TableCell className="font-medium">
                      {req.operatorName}
                      <p className="text-xs text-slate-500 truncate max-w-xs mt-1" title={req.justification}>
                        Motivazione: {req.justification}
                      </p>
                    </TableCell>
                    <TableCell className="text-center">{req.current_rate}%</TableCell>
                    <TableCell className="text-center font-semibold text-[hsl(var(--primary-dark))]">
                      {req.requested_rate}%
                    </TableCell>
                    <TableCell>{new Date(req.created_at).toLocaleDateString("it-IT")}</TableCell>
                    <TableCell>{getStatusBadge(req.status)}</TableCell>
                    <TableCell className="text-right">
                      <CommissionRequestActions request={req} />
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
