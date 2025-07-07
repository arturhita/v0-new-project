import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getOperatorEarningsSummary } from "@/lib/actions/payouts.actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, TrendingUp, Clock } from "lucide-react"

export default async function OperatorEarningsPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const earnings = await getOperatorEarningsSummary(user.id)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Riepilogo Guadagni</CardTitle>
          <CardDescription>Una panoramica delle tue performance finanziarie sulla piattaforma.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Guadagni Totali</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">€{earnings.total_earnings.toFixed(2)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Attesa di Pagamento</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">€{earnings.pending_payout.toFixed(2)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ultimo Pagamento</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">€{earnings.last_payout_amount?.toFixed(2) || "0.00"}</div>
                <p className="text-xs text-muted-foreground">
                  {earnings.last_payout_date
                    ? `in data ${new Date(earnings.last_payout_date).toLocaleDateString()}`
                    : "Nessun pagamento ricevuto"}
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
