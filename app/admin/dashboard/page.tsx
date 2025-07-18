import { getAdminDashboardStats } from "@/lib/actions/dashboard.actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserCheck, UserCog, DollarSign, BarChart } from "lucide-react"
import { unstable_noStore as noStore } from "next/cache"

export default async function AdminDashboardPage() {
  noStore()
  const { stats, error } = await getAdminDashboardStats()

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  if (!stats) {
    return <div>Caricamento statistiche...</div>
  }

  const formatCurrency = (amount: number | null) => {
    if (amount === null || amount === undefined) return "€ 0,00"
    return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(amount)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard Amministrazione</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utenti Totali</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_users ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Operatori Attivi</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_operators ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Operatori in Attesa</CardTitle>
            <UserCog className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending_operators ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fatturato Totale</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.total_revenue)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fatturato Mensile</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.monthly_revenue)}</div>
          </CardContent>
        </Card>
      </div>
      {/* Qui si possono aggiungere altri componenti, come grafici o tabelle riassuntive */}
    </div>
  )
}
