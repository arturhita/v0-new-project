import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserCheck, UserPlus, TrendingUp, Euro } from "lucide-react"
import { getAdminDashboardStats } from "@/lib/actions/dashboard.actions"

const StatCard = ({ title, value, icon: Icon, description }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
)

export default async function AdminDashboardPage() {
  const stats = await getAdminDashboardStats()

  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-3xl font-bold">Cruscotto Amministratore</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Utenti Totali"
          value={stats.total_users}
          icon={Users}
          description="Numero totale di clienti registrati."
        />
        <StatCard
          title="Operatori Attivi"
          value={stats.total_operators}
          icon={UserCheck}
          description="Numero totale di operatori approvati."
        />
        <StatCard
          title="Approvazioni Pendenti"
          value={stats.pending_operators}
          icon={UserPlus}
          description="Operatori in attesa di approvazione."
        />
        <StatCard
          title="Fatturato Mensile"
          value={new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(stats.monthly_revenue)}
          icon={TrendingUp}
          description="Fatturato generato nel mese corrente."
        />
        <StatCard
          title="Fatturato Totale"
          value={new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(stats.total_revenue)}
          icon={Euro}
          description="Fatturato totale generato."
        />
      </div>
    </div>
  )
}
