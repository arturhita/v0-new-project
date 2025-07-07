import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getOperatorEarnings, requestPayout } from "@/lib/actions/payouts.actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { it } from "date-fns/locale"
import { RequestPayoutButton } from "@/components/request-payout-button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal } from "lucide-react"

export default async function EarningsPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect("/login")
  }

  const earningsData = await getOperatorEarnings(user.id)

  if (!earningsData) {
    return (
      <Alert variant="destructive">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Errore</AlertTitle>
        <AlertDescription>Impossibile caricare i dati sui guadagni. Riprova più tardi.</AlertDescription>
      </Alert>
    )
  }

  const { balance, total_earned, total_withdrawn, transactions } = earningsData

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Guadagni e Pagamenti</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gray-800/50 border-gray-700 text-white">
          <CardHeader>
            <CardTitle>Saldo Attuale</CardTitle>
            <CardDescription className="text-gray-400">Disponibile per il ritiro</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">€{balance.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-800/50 border-gray-700 text-white">
          <CardHeader>
            <CardTitle>Guadagni Totali</CardTitle>
            <CardDescription className="text-gray-400">Dall'inizio della tua attività</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">€{total_earned.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-800/50 border-gray-700 text-white">
          <CardHeader>
            <CardTitle>Ritirato Totale</CardTitle>
            <CardDescription className="text-gray-400">Importo totale già pagato</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">€{total_withdrawn.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gray-800/50 border-gray-700 text-white">
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Storico Transazioni</CardTitle>
            <CardDescription className="text-gray-400">Dettaglio dei tuoi guadagni e pagamenti.</CardDescription>
          </div>
          <form action={requestPayout.bind(null, user.id)}>
            <RequestPayoutButton balance={balance} />
          </form>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700">
                <TableHead className="text-white">Data</TableHead>
                <TableHead className="text-white">Descrizione</TableHead>
                <TableHead className="text-white">Tipo</TableHead>
                <TableHead className="text-right text-white">Importo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions && transactions.length > 0 ? (
                transactions.map((tx: any) => (
                  <TableRow key={tx.id} className="border-gray-700">
                    <TableCell>
                      {tx.created_at ? format(new Date(tx.created_at), "d MMM yyyy", { locale: it }) : "N/A"}
                    </TableCell>
                    <TableCell className="font-medium">{tx.description}</TableCell>
                    <TableCell>
                      <Badge variant={tx.type === "earning" ? "default" : "secondary"}>
                        {tx.type === "earning" ? "Guadagno" : "Pagamento"}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className={`text-right font-semibold ${
                        tx.type === "earning" ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {tx.type === "earning" ? "+" : "-"}€{tx.amount.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-gray-400 py-8">
                    Nessuna transazione trovata.
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
