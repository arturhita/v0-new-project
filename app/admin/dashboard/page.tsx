import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Briefcase, DollarSign, Activity, Target, Zap, TrendingUp, Plus } from "lucide-react"
import Link from "next/link"
import { getAdminDashboardStats } from "@/lib/actions/admin.actions"

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
            <div className="text-2xl font-bold">{stats.usersCount}</div>
            <p className="text-xs text-muted-foreground">Totale clienti</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Operatori Attivi</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.operatorsCount}</div>
            <p className="text-xs text-muted-foreground">Operatori approvati e attivi</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entrate Totali (Mese)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€ {stats.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">(Dato di esempio)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consulenze (Oggi)</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.consultationsToday}</div>
            <p className="text-xs text-muted-foreground">(Dato di esempio)</p>
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
                  Nuova Promozione
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {/* Promozione attiva esempio */}
              <div className="p-4 bg-white rounded-lg border border-yellow-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">Weekend Speciale</h4>
                  <Badge className="bg-green-100 text-green-800 border-green-300">
                    <Zap className="h-3 w-3 mr-1" />
                    Attiva
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl font-bold text-green-600">€0.99</span>
                  <span className="text-sm text-muted-foreground line-through">€1.99</span>
                  <Badge variant="outline" className="text-green-600 border-green-300">
                    -50%
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">Sabato e Domenica</p>
              </div>

              {/* Statistiche promozioni */}
              <div className="p-4 bg-white rounded-lg border border-yellow-200 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  <h4 className="font-semibold">Statistiche</h4>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Promozioni attive:</span>
                    <span className="font-semibold">1</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Risparmio medio:</span>
                    <span className="font-semibold text-green-600">€1.00</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Sconto medio:</span>
                    <span className="font-semibold text-blue-600">50%</span>
                  </div>
                </div>
              </div>

              {/* Azioni rapide */}
              <div className="p-4 bg-white rounded-lg border border-yellow-200 shadow-sm">
                <h4 className="font-semibold mb-3">Azioni Rapide</h4>
                <div className="space-y-2">
                  <Link href="/admin/promotions">
                    <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                      <Target className="h-4 w-4 mr-2" />
                      Gestisci Promozioni
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Statistiche Dettagliate
                  </Button>
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
            {/* Qui potrebbe esserci una tabella o lista di attività */}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
