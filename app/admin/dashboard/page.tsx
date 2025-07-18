import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Briefcase, BarChart, CircleDollarSign } from "lucide-react"
import { getDashboardStats } from "@/lib/actions/analytics.actions"
import { DashboardLayout } from "@/components/dashboard-layout"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const revalidate = 60 // Revalida le statistiche ogni minuto

export default async function AdminDashboardPage() {
  const { data: stats, error } = await getDashboardStats()

  return (
    <DashboardLayout userType="admin" title="Dashboard Amministratore">
      {error && <div className="text-red-500 p-4 bg-red-100 rounded-md">{error}</div>}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utenti Totali</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Utenti registrati sulla piattaforma</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Operatori Attivi</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOperators}</div>
            <p className="text-xs text-muted-foreground">Operatori approvati e attivi</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fatturato Totale</CardTitle>
            <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              €
              {Number(stats.totalRevenue).toLocaleString("it-IT", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <p className="text-xs text-muted-foreground">Basato sugli acquisti di crediti</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consulenze Effettuate</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalConsultations}</div>
            <p className="text-xs text-muted-foreground">Numero totale di consulenze completate</p>
          </CardContent>
        </Card>
      </div>
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Gestione Promozioni</CardTitle>
            <p className="text-sm text-muted-foreground">
              Crea e gestisci prezzi speciali che si applicano automaticamente a tutti gli operatori.
            </p>
          </CardHeader>
          <CardContent>
            <Link href="/admin/promotions">
              <Button>Vai alla Gestione Promozioni</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
