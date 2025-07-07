import { getWalletBalance } from "@/lib/actions/wallet.actions"
import WalletRecharge from "@/components/wallet-recharge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { DollarSign, History } from "lucide-react"

// Dati mock per la cronologia, li renderemo dinamici in seguito
const mockTransactions = [
  { id: 1, type: "Ricarica", amount: 50.0, date: "2024-07-15" },
  { id: 2, type: "Consulto", amount: -25.5, date: "2024-07-14" },
  { id: 3, type: "Consulto", amount: -15.0, date: "2024-07-12" },
  { id: 4, type: "Ricarica", amount: 20.0, date: "2024-07-10" },
]

export default async function ClientWalletPage() {
  const walletData = await getWalletBalance()
  const balance = walletData.error ? 0 : Number(walletData.balance)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Il Mio Wallet</h1>
        <p className="text-muted-foreground">
          Visualizza il tuo saldo, ricarica il tuo account e controlla la cronologia delle transazioni.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Attuale</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">€{balance.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Saldo disponibile per i consulti</p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Ricarica il tuo Wallet</CardTitle>
            <CardDescription>Aggiungi fondi al tuo account per non interrompere mai un consulto.</CardDescription>
          </CardHeader>
          <CardContent>
            <WalletRecharge currentBalance={balance} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <History className="mr-2 h-5 w-5" />
            Cronologia Transazioni
          </CardTitle>
          <CardDescription>Le tue ultime 10 transazioni.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="font-medium">{tx.type}</p>
                  <p className="text-sm text-muted-foreground">{new Date(tx.date).toLocaleDateString("it-IT")}</p>
                </div>
                <div className={`font-semibold ${tx.amount > 0 ? "text-green-600" : "text-red-600"}`}>
                  {tx.amount > 0 ? "+" : ""}€{tx.amount.toFixed(2)}
                </div>
              </div>
            ))}
            {mockTransactions.length === 0 && (
              <p className="text-center text-muted-foreground py-4">Nessuna transazione recente.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
