import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getOperatorEarnings, requestPayout } from "@/lib/actions/payouts.actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { it } from "date-fns/locale"
import { RequestPayoutButton } from "@/components/request-payout-button"
import { revalidatePath } from "next/cache"

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
    return <div>Errore nel caricamento dei dati sui guadagni.</div>
  }

  const { balance, total_earned, total_withdrawn, transactions } = earningsData

  const handleRequestPayout = async () => {
    "use server"
    await requestPayout(user.id)
    revalidatePath("/dashboard/operator/earnings")
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Guadagni e Pagamenti</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Saldo Attuale</CardTitle>
            <CardDescription>Disponibile per il ritiro</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">€{balance.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Guadagni Totali</CardTitle>
            <CardDescription>Dall'inizio della tua attività</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">€{total_earned.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Ritirato Totale</CardTitle>
            <CardDescription>Importo totale già pagato</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">€{total_withdrawn.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Storico Transazioni</CardTitle>
            <CardDescription>Dettaglio dei tuoi guadagni e pagamenti.</CardDescription>
          </div>
          <form action={handleRequestPayout} className="mt-4 md:mt-0">
            <RequestPayoutButton balance={balance} />
          </form>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Descrizione</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Importo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions && transactions.length > 0 ? (
                transactions.map((tx: any) => (
                  <TableRow key={tx.id}>
                    <TableCell>
                      {format(new Date(tx.created_at), "d MMM yyyy", {
                        locale: it,
                      })}
                    </TableCell>
                    <TableCell className="font-medium">{tx.description}</TableCell>
                    <TableCell>
                      <Badge variant={tx.type === "earning" ? "default" : "secondary"}>
                        {tx.type === "earning" ? "Guadagno" : "Pagamento"}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className={`text-right font-semibold ${
                        tx.type === "earning" ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {tx.type === "earning" ? "+" : "-"}€{tx.amount.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
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
