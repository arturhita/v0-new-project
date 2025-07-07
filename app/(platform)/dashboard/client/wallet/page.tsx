import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { WalletRecharge } from "@/components/wallet-recharge"
import { getWalletTransactions } from "@/lib/actions/wallet.actions"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns"
import { it } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"

function TransactionTypeBadge({ type }: { type: string }) {
  switch (type) {
    case "recharge":
      return <Badge className="bg-green-100 text-green-800">Ricarica</Badge>
    case "consultation_fee":
      return <Badge className="bg-red-100 text-red-800">Consulto</Badge>
    case "refund":
      return <Badge className="bg-blue-100 text-blue-800">Rimborso</Badge>
    default:
      return <Badge variant="secondary">{type}</Badge>
  }
}

export default async function ClientWalletPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: wallet } = await supabase.from("wallets").select("balance").eq("user_id", user.id).single()
  const transactions = await getWalletTransactions(user.id)

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Il Tuo Wallet</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Saldo Attuale</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">€{wallet?.balance?.toFixed(2) || "0.00"}</p>
            <p className="text-sm text-muted-foreground mt-2">Usa il tuo credito per le consulenze.</p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Ricarica Credito</CardTitle>
            <CardDescription>Aggiungi fondi al tuo wallet in modo sicuro.</CardDescription>
          </CardHeader>
          <CardContent>
            <WalletRecharge />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Storico Transazioni</CardTitle>
          <CardDescription>Visualizza tutti i movimenti del tuo wallet.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Descrizione</TableHead>
                <TableHead className="text-right">Importo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length > 0 ? (
                transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>{format(new Date(tx.created_at), "d MMM yyyy, HH:mm", { locale: it })}</TableCell>
                    <TableCell>
                      <TransactionTypeBadge type={tx.type} />
                    </TableCell>
                    <TableCell>{tx.description}</TableCell>
                    <TableCell
                      className={`text-right font-medium ${tx.amount > 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {tx.amount > 0 ? "+" : ""}€{Number(tx.amount).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
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
