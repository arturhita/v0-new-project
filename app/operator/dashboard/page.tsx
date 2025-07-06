// Dashboard Operatore generica
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarDays, MessageCircle, DollarSign } from "lucide-react"

export default function OperatorDashboardPage() {
  return (
    <DashboardLayout userType="operator" title="Dashboard Operatore">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prossimi Appuntamenti</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Nelle prossime 24 ore</p>
            <Button size="sm" className="mt-2">
              Vedi Calendario
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messaggi Non Letti</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <Button size="sm" variant="outline" className="mt-2">
              Leggi Messaggi
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Guadagni del Mese</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€ 875.50</div>
            <p className="text-xs text-muted-foreground">Al lordo delle commissioni</p>
          </CardContent>
        </Card>
      </div>
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Le Tue Statistiche di Performance</CardTitle>
            <CardDescription>Panoramica delle tue attività recenti.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Statistiche non ancora disponibili (placeholder).</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
