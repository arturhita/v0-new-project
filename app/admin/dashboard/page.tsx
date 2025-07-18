import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Users, Briefcase, DollarSign, Activity } from "lucide-react"
import { getAdminDashboardStats } from "@/lib/actions/analytics.actions"
import PromotionsSection from "./promotions-section"

export const revalidate = 60 // Revalida i dati ogni 60 secondi

export default async function AdminDashboardPage() {
  const stats = await getAdminDashboardStats()

  return (
    <DashboardLayout userType="admin" title="Dashboard Amministratore">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utenti Registrati</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Totali sulla piattaforma</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Operatori Attivi</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOperators}</div>
            <p className="text-xs text-muted-foreground">Operatori verificati</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entrate Totali</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€ {stats.totalRevenue.toLocaleString("it-IT")}</div>
            <p className="text-xs text-muted-foreground">Dall'inizio</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consulenze Effettuate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalConsultations}</div>
            <p className="text-xs text-muted-foreground">Totali</p>
          </CardContent>
        </Card>
      </div>

      <PromotionsSection />

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Attività Recenti sulla Piattaforma</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Sezione attività recenti in costruzione.</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
