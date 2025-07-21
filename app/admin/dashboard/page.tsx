import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Briefcase, DollarSign, Activity, Target, Plus, TrendingUp } from "lucide-react"
import Link from "next/link"
import { getAdminDashboardData } from "@/lib/actions/dashboard.actions"

export default async function AdminDashboardPage() {
  const data = await getAdminDashboardData()
  const { kpis } = data || { kpis: {} } // Fallback for safety

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
    }).format(amount)
  }

  return (
    <DashboardLayout userType="admin" title="Dashboard Amministratore">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utenti Registrati</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.totalUsers ?? 0}</div>
            <p className="text-xs text-muted-foreground">+{kpis.newUsersThisMonth ?? 0} questo mese</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Operatori Attivi</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.activeOperators ?? 0}</div>
            <p className="text-xs text-muted-foreground">+{kpis.newOperatorsThisWeek ?? 0} questa settimana</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entrate (Mese)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(kpis.revenueThisMonth ?? 0)}</div>
            <p className="text-xs text-muted-foreground">Mese corrente</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consulenze (24h)</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.consultationsLast24h ?? 0}</div>
            <p className="text-xs text-muted-foreground">Ultime 24 ore</p>
          </CardContent>
        </Card>
      </div>

      {/* Sezione Promozioni */}
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
                  <p className="text-sm text-muted-foreground">Imposta prezzi speciali per giorni specifici</p>
                </div>
              </div>
              <Link href="/admin/promotions">
                <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Gestisci Promozioni
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 bg-white rounded-lg border border-yellow-200 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  <h4 className="font-semibold">Statistiche</h4>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Promozioni attive:</span>
                    <span className="font-semibold">{kpis.activePromotions ?? 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Sistema automatico:</span>
                    <span className="font-semibold text-green-600">
                      {(kpis.activePromotions ?? 0) > 0 ? "ATTIVO" : "INATTIVO"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-white rounded-lg border border-yellow-200 shadow-sm">
                <h4 className="font-semibold mb-3">Azioni Rapide</h4>
                <div className="space-y-2">
                  <Link href="/admin/promotions">
                    <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                      <Target className="h-4 w-4 mr-2" />
                      Gestisci Tutte le Promozioni
                    </Button>
                  </Link>
                  <Link href="/admin/promotions">
                    <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                      <Plus className="h-4 w-4 mr-2" />
                      Crea Nuova Promozione
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Attività Recenti sulla Piattaforma</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Nessuna attività recente da mostrare (placeholder).</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
