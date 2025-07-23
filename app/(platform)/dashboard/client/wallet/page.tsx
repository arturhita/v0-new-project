import { WalletRecharge } from "@/components/wallet-recharge"
import { getTransactionHistory, getWalletBalance } from "@/lib/actions/wallet.actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { it } from "date-fns/locale"

export default async function WalletPage() {
  const [{ balance }, { transactions }] = await Promise.all([getWalletBalance(), getTransactionHistory()])

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return "N/A"
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
    }).format(amount)
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white">Il Tuo Portafoglio</h1>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <Card className="md:col-span-1 bg-gray-900/50 border-yellow-500/20">
          <CardHeader>
            <CardTitle className="text-amber-300">Saldo Attuale</CardTitle>
            <CardDescription>Il tuo credito disponibile per le consulenze.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-bold text-white">{formatCurrency(balance ?? 0)}</p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 bg-gray-900/50 border-yellow-500/20">
          <CardHeader>
            <CardTitle className="text-amber-300">Ricarica Credito</CardTitle>
            <CardDescription>Aggiungi fondi al tuo portafoglio in modo sicuro con Stripe.</CardDescription>
          </CardHeader>
          <CardContent>
            <WalletRecharge />
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gray-900/50 border-yellow-500/20">
        <CardHeader>
          <CardTitle className="text-amber-300">Storico Transazioni</CardTitle>
          <CardDescription>Visualizza tutte le tue ricariche e i tuoi addebiti.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700 hover:bg-gray-800/50">
                <TableHead className="text-white">Data</TableHead>
                <TableHead className="text-white">Tipo</TableHead>
                <TableHead className="text-white">Descrizione</TableHead>
                <TableHead className="text-right text-white">Importo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions && transactions.length > 0 ? (
                transactions.map((tx) => (
                  <TableRow key={tx.id} className="border-gray-800 hover:bg-gray-800/50">
                    <TableCell className="text-gray-300">
                      {format(new Date(tx.created_at), "d MMM yyyy, HH:mm", { locale: it })}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={tx.transaction_type === "deposit" ? "success" : "destructive"}
                        className="capitalize"
                      >
                        {tx.transaction_type === "deposit" ? "Ricarica" : "Addebito"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-300">{tx.description}</TableCell>
                    <TableCell
                      className={`text-right font-medium ${
                        tx.transaction_type === "deposit" ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {tx.transaction_type === "deposit" ? "+" : "-"}
                      {formatCurrency(tx.amount)}
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
