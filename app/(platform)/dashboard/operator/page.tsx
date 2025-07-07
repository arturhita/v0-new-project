import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getOperatorDashboardData } from "@/lib/actions/operator.actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Euro, Briefcase, MessageSquare, AlertCircle } from "lucide-react"

export default async function OperatorDashboardPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data, error } = await getOperatorDashboardData(user.id)

  if (error) {
    return (
      <div className="flex items-center gap-x-2 rounded-md border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-500">
        <AlertCircle className="h-4 w-4" />
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      <p className="text-gray-600">Panoramica della tua attività sulla piattaforma.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Guadagni del Mese</CardTitle>
            <Euro className="h-5 w-5 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">€{data?.monthly_earnings?.toFixed(2) ?? "0.00"}</div>
            <p className="text-xs text-gray-500">Guadagni netti per il mese corrente</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Consulti Completati</CardTitle>
            <Briefcase className="h-5 w-5 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">+{data?.consultations_count ?? 0}</div>
            <p className="text-xs text-gray-500">Nel mese corrente</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Messaggi Non Letti</CardTitle>
            <MessageSquare className="h-5 w-5 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{data?.unread_messages_count ?? 0}</div>
            <p className="text-xs text-gray-500">Totale messaggi da leggere</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
