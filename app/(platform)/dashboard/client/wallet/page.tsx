import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { WalletRecharge } from "@/components/wallet-recharge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Coins, History } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

async function getWalletData(userId: string) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const { data: wallet, error: walletError } = await supabase
    .from("wallets")
    .select("id, balance_cents")
    .eq("user_id", userId)
    .single()

  if (walletError || !wallet) {
    console.error("Wallet not found for user:", userId, walletError)
    return { balance: 0, transactions: [] }
  }

  const { data: transactions, error: transactionsError } = await supabase
    .from("transactions")
    .select("*")
    .eq("wallet_id", wallet.id)
    .order("created_at", { ascending: false })
    .limit(10)

  if (transactionsError) {
    console.error("Error fetching transactions:", transactionsError)
  }

  return {
    balance: wallet.balance_cents / 100,
    transactions: transactions || [],
  }
}

export default async function WalletPage() {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { balance, transactions } = await getWalletData(user.id)

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white">Il Mio Portafoglio</h1>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <Card className="bg-slate-900/50 border-purple-500/30 text-white">
            <CardHeader>
              <CardTitle>Ricarica Credito</CardTitle>
              <CardDescription className="text-slate-400">
                Aggiungi fondi al tuo portafoglio per i consulti.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WalletRecharge />
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card className="bg-slate-900/50 border-purple-500/30 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins />
                Saldo Attuale
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-5xl font-bold text-purple-400">
                {balance.toLocaleString("it-IT", { style: "currency", currency: "EUR" })}
              </p>
            </CardContent>
          </Card>

          <Card className="mt-8 bg-slate-900/50 border-purple-500/30 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History />
                Ultime Transazioni
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700 hover:bg-slate-800/50">
                    <TableHead className="text-white">Data</TableHead>
                    <TableHead className="text-white">Descrizione</TableHead>
                    <TableHead className="text-white">Tipo</TableHead>
                    <TableHead className="text-right text-white">Importo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.length > 0 ? (
                    transactions.map((tx) => (
                      <TableRow key={tx.id} className="border-slate-800 hover:bg-slate-800/50">
                        <TableCell>{new Date(tx.created_at).toLocaleDateString("it-IT")}</TableCell>
                        <TableCell>{tx.description}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              tx.type === "credit" ? "border-green-500 text-green-400" : "border-red-500 text-red-400",
                            )}
                          >
                            {tx.type === "credit" ? "Credito" : "Debito"}
                          </Badge>
                        </TableCell>
                        <TableCell
                          className={cn(
                            "text-right font-mono",
                            tx.type === "credit" ? "text-green-400" : "text-red-400",
                          )}
                        >
                          {(tx.amount_cents / 100).toLocaleString("it-IT", { style: "currency", currency: "EUR" })}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-slate-400">
                        Nessuna transazione trovata.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
