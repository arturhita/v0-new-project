"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  DollarSign,
  Activity,
  TrendingUp,
  MessageSquare,
  Star,
  AlertTriangle,
  CheckCircle,
  Clock,
  UserPlus,
  Settings,
  Mail,
  Bell,
  Shield,
  BarChart3,
  Gamepad2,
  CreditCard,
  FileText,
  Zap,
} from "lucide-react"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import SendMessageModal from "@/components/send-message-modal"
import SendNewsletterModal from "@/components/send-newsletter-modal"
import { toast } from "@/hooks/use-toast"

type ChartData = {
  month: string
  revenue?: number
  users?: number
  consultations?: number
}

type CategoryData = {
  name: string
  value: number
  color: string
}

type ActivityData = {
  type: string
  message: string
  time: string
  status: string
}

interface AdminDashboardClientProps {
  revenueChartData: ChartData[]
  categoryChartData: CategoryData[]
  usersGrowthData: ChartData[]
  consultationsData: ChartData[]
  recentActivity: ActivityData[]
  pendingOperatorsCount: number
}

export function AdminDashboardClient({
  revenueChartData,
  categoryChartData,
  usersGrowthData,
  consultationsData,
  recentActivity,
  pendingOperatorsCount,
}: AdminDashboardClientProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState("30d")
  const [showMessageModal, setShowMessageModal] = useState(false)
  const [showNewsletterModal, setShowNewsletterModal] = useState(false)

  // Quick Actions Handlers
  const handleQuickAction = async (action: string) => {
    setIsLoading(true)
    console.log(`Executing quick action: ${action}`)

    // Simula operazione
    await new Promise((resolve) => setTimeout(resolve, 1000))

    switch (action) {
      case "approve-operators":
        toast({
          title: "Operatori approvati",
          description: "3 operatori approvati con successo!",
        })
        break
      case "send-newsletter":
        setShowNewsletterModal(true)
        break
      case "send-message":
        setShowMessageModal(true)
        break
      case "backup-data":
        toast({
          title: "Backup completato",
          description: "Backup completato con successo!",
        })
        break
      case "check-payments":
        toast({
          title: "Pagamenti controllati",
          description: "Controllo pagamenti completato - 2 problemi risolti",
        })
        break
      case "moderate-reviews":
        toast({
          title: "Recensioni moderate",
          description: "5 recensioni moderate con successo!",
        })
        break
      case "system-maintenance":
        toast({
          title: "Manutenzione programmata",
          description: "Manutenzione sistema programmata per stanotte",
        })
        break
      default:
        toast({
          title: "Azione eseguita",
          description: `Azione ${action} eseguita!`,
        })
    }

    setIsLoading(false)
  }

  return (
    <>
      <div className="flex gap-2 my-4">
        {["7d", "30d", "90d"].map((period) => (
          <Button
            key={period}
            size="sm"
            variant={selectedPeriod === period ? "default" : "outline"}
            onClick={() => setSelectedPeriod(period)}
            className={selectedPeriod === period ? "bg-sky-500" : "border-sky-300 text-sky-600"}
          >
            {period === "7d" ? "7 giorni" : period === "30d" ? "30 giorni" : "3 mesi"}
          </Button>
        ))}
      </div>
      <Tabs defaultValue="analytics" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-sky-100">
          <TabsTrigger value="analytics" className="data-[state=active]:bg-sky-500 data-[state=active]:text-white">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="quick-actions" className="data-[state=active]:bg-sky-500 data-[state=active]:text-white">
            <Zap className="w-4 h-4 mr-2" />
            Comandi Rapidi
          </TabsTrigger>
          <TabsTrigger value="activity" className="data-[state=active]:bg-sky-500 data-[state=active]:text-white">
            <Activity className="w-4 h-4 mr-2" />
            Attività Recenti
          </TabsTrigger>
        </TabsList>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <Card className="border-sky-200">
              <CardHeader>
                <CardTitle className="text-sky-800 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-sky-500" />
                  Andamento Fatturato (Ultimi 6 mesi)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={revenueChartData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`€${Number(value).toFixed(2)}`, "Fatturato"]} />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#0EA5E9"
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Category Distribution */}
            <Card className="border-sky-200">
              <CardHeader>
                <CardTitle className="text-sky-800 flex items-center">
                  <Star className="w-5 h-5 mr-2 text-sky-500" />
                  Distribuzione Categorie (Dati Mock)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryChartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Users Growth */}
            <Card className="border-sky-200">
              <CardHeader>
                <CardTitle className="text-sky-800 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-sky-500" />
                  Crescita Utenti (Dati Mock)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={usersGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="users" stroke="#06B6D4" strokeWidth={3} name="Nuovi Utenti" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Consultations Chart */}
            <Card className="border-sky-200">
              <CardHeader>
                <CardTitle className="text-sky-800 flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2 text-sky-500" />
                  Consulenze Mensili (Dati Mock)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={consultationsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="consultations" fill="#0EA5E9" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Quick Actions Tab */}
        <TabsContent value="quick-actions" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Gestione Utenti */}
            <Card className="border-sky-200 bg-gradient-to-br from-sky-50 to-cyan-50">
              <CardHeader>
                <CardTitle className="text-sky-800 flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Gestione Utenti
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() => (window.location.href = "/admin/operator-approvals")}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-sky-500 to-cyan-500 text-white"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Approva Operatori ({pendingOperatorsCount})
                </Button>
                <Button
                  onClick={() => (window.location.href = "/admin/users")}
                  variant="outline"
                  className="w-full border-sky-300 text-sky-600"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Gestisci Utenti
                </Button>
              </CardContent>
            </Card>

            {/* Comunicazioni */}
            <Card className="border-sky-200 bg-gradient-to-br from-sky-50 to-cyan-50">
              <CardHeader>
                <CardTitle className="text-sky-800 flex items-center">
                  <Mail className="w-5 h-5 mr-2" />
                  Comunicazioni
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() => handleQuickAction("send-newsletter")}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-sky-500 to-cyan-500 text-white"
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Invia Newsletter
                </Button>
                <Button
                  onClick={() => handleQuickAction("send-message")}
                  variant="outline"
                  className="w-full border-sky-300 text-sky-600"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Invia Messaggio
                </Button>
              </CardContent>
            </Card>

            {/* Sistema */}
            <Card className="border-sky-200 bg-gradient-to-br from-sky-50 to-cyan-50">
              <CardHeader>
                <CardTitle className="text-sky-800 flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Sistema
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() => handleQuickAction("backup-data")}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-sky-500 to-cyan-500 text-white"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Backup Dati
                </Button>
                <Button
                  onClick={() => handleQuickAction("system-maintenance")}
                  variant="outline"
                  className="w-full border-sky-300 text-sky-600"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Manutenzione
                </Button>
              </CardContent>
            </Card>

            {/* Pagamenti */}
            <Card className="border-sky-200 bg-gradient-to-br from-sky-50 to-cyan-50">
              <CardHeader>
                <CardTitle className="text-sky-800 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Pagamenti
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() => handleQuickAction("check-payments")}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-sky-500 to-cyan-500 text-white"
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Controlla Pagamenti
                </Button>
                <Button
                  onClick={() => (window.location.href = "/admin/payouts")}
                  variant="outline"
                  className="w-full border-sky-300 text-sky-600"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Gestisci Pagamenti
                </Button>
              </CardContent>
            </Card>

            {/* Moderazione */}
            <Card className="border-sky-200 bg-gradient-to-br from-sky-50 to-cyan-50">
              <CardHeader>
                <CardTitle className="text-sky-800 flex items-center">
                  <Star className="w-5 h-5 mr-2" />
                  Moderazione
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() => handleQuickAction("moderate-reviews")}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-sky-500 to-cyan-500 text-white"
                >
                  <Star className="w-4 h-4 mr-2" />
                  Modera Recensioni (5)
                </Button>
                <Button
                  onClick={() => (window.location.href = "/admin/reviews")}
                  variant="outline"
                  className="w-full border-sky-300 text-sky-600"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Centro Moderazione
                </Button>
              </CardContent>
            </Card>

            {/* Sistema Gaming */}
            <Card className="border-sky-200 bg-gradient-to-br from-sky-50 to-cyan-50">
              <CardHeader>
                <CardTitle className="text-sky-800 flex items-center">
                  <Gamepad2 className="w-5 h-5 mr-2" />
                  Sistema Gaming
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() => (window.location.href = "/admin/gamification")}
                  className="w-full bg-gradient-to-r from-sky-500 to-cyan-500 text-white"
                >
                  <Gamepad2 className="w-4 h-4 mr-2" />
                  Gestisci Gaming
                </Button>
                <Button
                  onClick={() => (window.location.href = "/admin/gamification/analytics")}
                  variant="outline"
                  className="w-full border-sky-300 text-sky-600"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytics Gaming
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          <Card className="border-sky-200">
            <CardHeader>
              <CardTitle className="text-sky-800 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-sky-500" />
                Attività Recenti sulla Piattaforma (Dati Mock)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-sky-50 rounded-lg border border-sky-100"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          activity.status === "success"
                            ? "bg-green-500"
                            : activity.status === "warning"
                              ? "bg-yellow-500"
                              : "bg-red-500"
                        }`}
                      />
                      <div>
                        <p className="text-sky-800 font-medium">{activity.message}</p>
                        <p className="text-sky-600 text-sm">{activity.time}</p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        activity.status === "success"
                          ? "default"
                          : activity.status === "warning"
                            ? "secondary"
                            : "destructive"
                      }
                      className={
                        activity.status === "success"
                          ? "bg-green-100 text-green-800"
                          : activity.status === "warning"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }
                    >
                      {activity.status === "success"
                        ? "Completato"
                        : activity.status === "warning"
                          ? "In Attesa"
                          : "Errore"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Alerts Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="font-medium text-yellow-800">{pendingOperatorsCount} Operatori in Attesa</p>
                <p className="text-sm text-yellow-600">Richiedono approvazione</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="font-medium text-green-800">Sistema Operativo</p>
                <p className="text-sm text-green-600">Tutti i servizi attivi</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-sky-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-blue-500" />
              <div>
                <p className="font-medium text-blue-800">Backup Programmato</p>
                <p className="text-sm text-blue-600">Prossimo: Oggi 02:00</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <SendMessageModal isOpen={showMessageModal} onClose={() => setShowMessageModal(false)} />
      <SendNewsletterModal isOpen={showNewsletterModal} onClose={() => setShowNewsletterModal(false)} />
    </>
  )
}
