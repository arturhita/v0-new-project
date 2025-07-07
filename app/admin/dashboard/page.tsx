import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Briefcase, DollarSign, Activity, Target, Plus } from "lucide-react"
import Link from "next/link"
import { getAdminDashboardStats } from "@/lib/actions/dashboard.actions"

export default async function AdminDashboardPage() {
  const stats = await getAdminDashboardStats()

  return (
    <DashboardLayout userType="admin" title="Dashboard Amministratore">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utenti Totali</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Utenti registrati sulla piattaforma.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Operatori Attivi</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeOperators}</div>
            <p className="text-xs text-muted-foreground">Operatori approvati e visibili.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entrate Piattaforma</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€ {stats.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Totale commissioni generate.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consulenze (Oggi)</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.consultationsToday}</div>
            <p className="text-xs text-muted-foreground">Sessioni avviate oggi.</p>
          </CardContent>
        </Card>
      </div>

      {/* Sezione Promozioni (mantiene dati statici per ora) */}
      <div className="mt-6">
        <Card className="border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500 rounded-lg">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">Gestione Promozioni</CardTitle>
                  <p className="text-sm text-muted-foreground">Crea e gestisci offerte speciali.</p>
                </div>
              </div>
              <Link href="/admin/promotions">
                <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Nuova Promozione
                </Button>
              </Link>
            </div>
          </CardHeader>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Attività Recenti sulla Piattaforma</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Elenco delle ultime attività (da implementare).</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
