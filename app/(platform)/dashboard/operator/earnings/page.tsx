import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DollarSign, Banknote, Hourglass } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

export default async function OperatorEarningsPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect("/login")
  }

  const summaryPromise = supabase.rpc("get_operator_earnings_summary", { p_operator_id: user.id }).single()

  const earningsPromise = supabase
    .from("operator_earnings")
    .select("*, consultation:consultation_id(type, client:client_id(full_name))")
    .eq("operator_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20)

  const [{ data: summary, error: summaryError }, { data: earnings, error: earningsError }] = await Promise.all([
    summaryPromise,
    earningsPromise,
  ])

  if (summaryError) console.error("Error fetching earnings summary:", summaryError)
  if (earningsError) console.error("Error fetching earnings:", earningsError)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Riepilogo Guadagni</h1>
        <p className="text-muted-foreground">Tieni traccia dei tuoi guadagni e dei pagamenti.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Guadagni Totali</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary?.total_earnings)}</div>
            <p className="text-xs text-muted-foreground">Dall'inizio della tua attività</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo da Pagare</CardTitle>
            <Hourglass className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary?.pending_payout)}</div>
            <p className="text-xs text-muted-foreground">Disponibile per il prossimo pagamento</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ultimo Pagamento</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary?.last_payout_amount)}</div>
            <p className="text-xs text-muted-foreground">
              {summary?.last_payout_date
                ? `in data ${formatDate(summary.last_payout_date)}`
                : "Nessun pagamento ricevuto"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cronologia Guadagni</CardTitle>
          <CardDescription>Dettaglio degli ultimi guadagni per consulto.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Tipo Consulto</TableHead>
                <TableHead className="text-right">Importo Lordo</TableHead>
                <TableHead className="text-right">Commissione</TableHead>
                <TableHead className="text-right">Importo Netto</TableHead>
                <TableHead className="text-center">Stato</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {earnings && earnings.length > 0 ? (
                earnings.map((earning) => (
                  <TableRow key={earning.id}>
                    <TableCell>{formatDate(earning.created_at)}</TableCell>
                    <TableCell>{earning.consultation?.client?.full_name || "N/A"}</TableCell>
                    <TableCell className="capitalize">{earning.consultation?.type || "N/A"}</TableCell>
                    <TableCell className="text-right">{formatCurrency(earning.amount)}</TableCell>
                    <TableCell className="text-right text-red-600">
                      - {formatCurrency(earning.amount - earning.net_earning)} ({earning.commission_rate}%)
                    </TableCell>
                    <TableCell className="text-right font-semibold text-green-600">
                      {formatCurrency(earning.net_earning)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={earning.status === "paid" ? "default" : "secondary"}
                        className={earning.status === "paid" ? "bg-green-100 text-green-800" : ""}
                      >
                        {earning.status === "paid" ? "Pagato" : "Non Pagato"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    Nessun guadagno registrato.
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
