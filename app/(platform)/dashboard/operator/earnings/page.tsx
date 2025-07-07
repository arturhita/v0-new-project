import { getOperatorEarningsSummary } from "@/lib/actions/payouts.actions"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, TrendingUp, Clock } from "lucide-react"
import { format } from "date-fns"
import { it } from "date-fns/locale"

export default async function OperatorEarningsPage() {
  const { data: summary, error } = await getOperatorEarningsSummary()

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Errore</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    )
  }

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return "N/A"
    return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(amount)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">I tuoi Guadagni</h1>
        <p className="text-gray-600">
          Tieni traccia dei tuoi guadagni totali, dei pagamenti in sospeso e dello storico dei pagamenti.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Guadagni Totali</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary?.total_earnings)}</div>
            <p className="text-xs text-muted-foreground">Guadagni netti totali sulla piattaforma</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In attesa di Pagamento</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary?.pending_payout)}</div>
            <p className="text-xs text-muted-foreground">Importo disponibile per il prossimo pagamento</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ultimo Pagamento</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary?.last_payout_amount)}</div>
            <p className="text-xs text-muted-foreground">
              {summary?.last_payout_date
                ? `Ricevuto il ${format(new Date(summary.last_payout_date), "dd MMMM yyyy", { locale: it })}`
                : "Nessun pagamento ricevuto"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Qui andrebbe lo storico dettagliato delle transazioni/guadagni */}
      <Card>
        <CardHeader>
          <CardTitle>Storico Guadagni</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">
            Lo storico dettagliato dei guadagni per ogni consulto sarà disponibile qui a breve.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
