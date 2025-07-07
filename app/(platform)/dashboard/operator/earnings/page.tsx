import type React from "react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getOperatorEarningsSummary } from "@/lib/actions/payouts.actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Euro } from "lucide-react"
import { format } from "date-fns"
import { it } from "date-fns/locale"

function StatCard({ title, value, icon: Icon }: { title: string; value: string; icon: React.ElementType }) {
  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-300">{title}</CardTitle>
        <Icon className="h-4 w-4 text-gray-400" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white">{value}</div>
      </CardContent>
    </Card>
  )
}

export default async function EarningsPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const earnings = await getOperatorEarningsSummary(user.id)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">I Tuoi Guadagni</h1>
        <p className="text-gray-400">Riepilogo delle tue performance finanziarie sulla piattaforma.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Guadagni Totali (Netto)"
          value={`€${Number(earnings.total_earnings).toFixed(2)}`}
          icon={Euro}
        />
        <StatCard title="In Attesa di Pagamento" value={`€${Number(earnings.pending_payout).toFixed(2)}`} icon={Euro} />
        <StatCard
          title="Ultimo Pagamento Ricevuto"
          value={earnings.last_payout_amount ? `€${Number(earnings.last_payout_amount).toFixed(2)}` : "N/A"}
          icon={Euro}
        />
      </div>
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle>Dettagli Ultimo Pagamento</CardTitle>
        </CardHeader>
        <CardContent>
          {earnings.last_payout_date ? (
            <p className="text-white">
              L'ultimo pagamento di €{Number(earnings.last_payout_amount).toFixed(2)} è stato processato il{" "}
              {format(new Date(earnings.last_payout_date), "dd MMMM yyyy", { locale: it })}.
            </p>
          ) : (
            <p className="text-gray-400">Nessun pagamento ancora ricevuto.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
