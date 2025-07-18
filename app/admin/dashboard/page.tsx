import { getDashboardStats } from "@/lib/actions/admin.actions"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Users, UserCheck, DollarSign, Bell, Star, MessageSquare } from "lucide-react"
import Link from "next/link"

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats()

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Cruscotto Amministratore</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utenti Totali</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_users}</div>
            <p className="text-xs text-muted-foreground">Clienti registrati sulla piattaforma</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Operatori Attivi</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_operators}</div>
            <p className="text-xs text-muted-foreground">Operatori attualmente attivi</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entrate Totali</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{Number(stats.total_revenue).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Basato su fatture pagate</p>
          </CardContent>
        </Card>
        <Link href="/admin/operator-approvals" className="block">
          <Card className="hover:bg-muted transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approvazioni in Attesa</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending_approvals}</div>
              <p className="text-xs text-muted-foreground">Nuove candidature da revisionare</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/reviews" className="block">
          <Card className="hover:bg-muted transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recensioni da Moderare</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending_reviews}</div>
              <p className="text-xs text-muted-foreground">Recensioni in attesa di approvazione</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/tickets" className="block">
          <Card className="hover:bg-muted transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ticket Aperti</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.open_tickets}</div>
              <p className="text-xs text-muted-foreground">Richieste di supporto da gestire</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
