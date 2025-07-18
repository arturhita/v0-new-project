import { getPayoutRequests } from "@/lib/actions/payouts.actions"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DollarSign } from 'lucide-react'
import PayoutActions from "./payout-actions"
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
    case "processing":
      return (
        <Badge variant="outline" className="border-blue-500 text-blue-600">
          In Elaborazione
        </Badge>
      )
    case "paid":
      return (
        <Badge variant="default" className="bg-emerald-500 text-white">
          Pagato
        </Badge>
      )
    case "rejected":
      return <Badge variant="destructive">Rifiutato</Badge>
    case "on_hold":
        return <Badge variant="secondary">In Sospeso</Badge>
    default:
      return <Badge>Sconosciuto</Badge>
  }
}

export default async function ManagePayoutsPage() {
  const payoutRequests = await getPayoutRequests()

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-slate-800">Gestione Pagamenti Operatori</h1>
      <CardDescription className="text-slate-500 -mt-4">
        Visualizza, processa e gestisci le richieste di pagamento inviate dagli operatori.
      </CardDescription>

      <Card className="shadow-xl rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl text-slate-700 flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-[hsl(var(--primary-medium))]" />
            Richieste di Payout
          </CardTitle>
        </CardHeader>
        <CardContent>
          {payoutRequests.length === 0 ? (
            <p className="text-slate-500 text-center py-4">Nessuna richiesta di pagamento al momento.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Operatore</TableHead>
                  <TableHead className="text-right">Importo</TableHead>
                  <TableHead>Data Richiesta</TableHead>
                  <TableHead>Metodo</TableHead>
                  <TableHead>Stato</TableHead>
                  <TableHead className="text-right">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payoutRequests.map((req: any) => (
                  <TableRow key={req.id}>
                    <TableCell className="font-medium">{req.operatorName}</TableCell>
                    <TableCell className="text-right">€{Number(req.amount).toFixed(2)}</TableCell>
                    <TableCell>{new Date(req.created_at).toLocaleDateString("it-IT")}</TableCell>
                    <TableCell>
                      {req.payment_details?.method}
                      <span className="text-xs block text-slate-500">{req.payment_details?.email || req.payment_details?.value}</span>
                    </TableCell>
                    <TableCell>{getStatusBadge(req.status)}</TableCell>
                    <TableCell className="text-right">
                      <PayoutActions request={req} />
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
