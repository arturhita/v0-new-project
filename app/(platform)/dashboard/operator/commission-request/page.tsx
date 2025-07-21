import { createClient } from "@/lib/supabase/server"
import { getCommissionRequestsForOperator } from "@/lib/actions/commission.actions"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CommissionRequestForm } from "./commission-request-form"
import { Percent, History } from "lucide-react"

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
      return <Badge>{status}</Badge>
  }
}

export default async function CommissionRequestPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase.from("profiles").select("commission_rate").eq("id", user!.id).single()
  const requests = await getCommissionRequestsForOperator()

  const currentCommission = profile?.commission_rate ?? 15

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-slate-800">Richiesta Modifica Decima</h1>
      <CardDescription className="text-slate-500 -mt-4">
        Invia una richiesta all'amministrazione per rinegoziare la tua percentuale di commissione.
      </CardDescription>

      <Card className="shadow-xl rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl text-slate-700 flex items-center">
            <Percent className="mr-2 h-5 w-5 text-[hsl(var(--primary-medium))]" /> Modifica la Tua Decima
          </CardTitle>
          <CardDescription className="text-slate-500">
            La tua commissione attuale è del:{" "}
            <span className="font-semibold text-[hsl(var(--primary-dark))]">{currentCommission}%</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CommissionRequestForm />
        </CardContent>
      </Card>

      <Card className="shadow-lg rounded-xl mt-6">
        <CardHeader>
          <CardTitle className="text-lg text-slate-700 flex items-center">
            <History className="mr-2 h-5 w-5 text-slate-500" /> Storico Richieste
          </CardTitle>
        </CardHeader>
        <CardContent>
          {requests.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Comm. Attuale</TableHead>
                  <TableHead>Comm. Richiesta</TableHead>
                  <TableHead>Stato</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell>{new Date(req.created_at).toLocaleDateString("it-IT")}</TableCell>
                    <TableCell>{req.current_commission_rate}%</TableCell>
                    <TableCell className="font-semibold">{req.requested_commission_rate}%</TableCell>
                    <TableCell>{getStatusBadge(req.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-slate-500 text-center py-4">Nessuna richiesta inviata.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
