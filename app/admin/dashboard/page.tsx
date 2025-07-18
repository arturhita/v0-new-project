import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserCheck, UserPlus, TrendingUp } from "lucide-react"
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Utenti Totali"
          value={stats.totalUsers}
          icon={Users}
          description="Numero totale di clienti registrati."
        />
        <StatCard
          title="Operatori Totali"
          value={stats.totalOperators}
          icon={UserCheck}
          description="Numero totale di operatori approvati."
        />
        <StatCard
          title="Approvazioni Pendenti"
          value={stats.pendingOperators}
          icon={UserPlus}
          description="Operatori in attesa di approvazione."
        />
        <StatCard
          title="Fatturato Mensile"
          value={new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(stats.monthlyRevenue)}
          icon={TrendingUp}
          description="Fatturato generato nel mese corrente."
        />
      </div>
      {/* Qui andranno altri componenti come grafici, attività recenti, etc. */}
    </div>
  )
}
