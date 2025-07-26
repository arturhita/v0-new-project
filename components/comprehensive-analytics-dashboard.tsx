"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  Legend,
  ResponsiveContainer,
} from "recharts"
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  MessageSquare,
  Star,
  Download,
  Target,
  Clock,
  Zap,
  Activity,
  Heart,
  Smartphone,
  AlertTriangle,
  CheckCircle,
} from "lucide-react"
import { commissionSystem } from "@/lib/commission-system"
import { timerBillingSystem } from "@/lib/timer-billing-system"

// Dati mock completi per analytics
const comprehensiveData = {
  overview: {
    totalRevenue: 284750,
    totalConsultations: 3567,
    activeUsers: 1234,
    averageRating: 4.7,
    conversionRate: 12.5,
    churnRate: 3.2,
    monthlyGrowth: 18.5,
    operatorSatisfaction: 89,
  },

  revenueData: [
    { month: "Gen", revenue: 45600, consultations: 567, newUsers: 189, churn: 23 },
    { month: "Feb", revenue: 52300, consultations: 634, newUsers: 234, churn: 18 },
    { month: "Mar", revenue: 48900, consultations: 598, newUsers: 201, churn: 25 },
    { month: "Apr", revenue: 55100, consultations: 687, newUsers: 267, churn: 19 },
    { month: "Mag", revenue: 61200, consultations: 743, newUsers: 298, churn: 21 },
    { month: "Giu", revenue: 67800, consultations: 821, newUsers: 334, churn: 16 },
  ],

  categoryPerformance: [
    { name: "Tarocchi", revenue: 89500, consultations: 1234, avgRating: 4.8, growth: 15.2 },
    { name: "Astrologia", revenue: 67300, consultations: 892, avgRating: 4.6, growth: 22.1 },
    { name: "Numerologia", revenue: 45200, consultations: 634, avgRating: 4.7, growth: 8.9 },
    { name: "Cartomanzia", revenue: 38900, consultations: 567, avgRating: 4.5, growth: 12.3 },
    { name: "Canalizzazione", revenue: 28400, consultations: 398, avgRating: 4.9, growth: 28.7 },
    { name: "Altro", revenue: 15450, consultations: 234, avgRating: 4.4, growth: 5.6 },
  ],

  operatorMetrics: [
    {
      id: "op1",
      name: "Luna Stellare",
      revenue: 12400,
      consultations: 156,
      rating: 4.9,
      responseTime: 2.3,
      satisfaction: 96,
    },
    {
      id: "op2",
      name: "Maestro Cosmos",
      revenue: 11800,
      consultations: 142,
      rating: 4.8,
      responseTime: 3.1,
      satisfaction: 94,
    },
    {
      id: "op3",
      name: "Sage Aurora",
      revenue: 10200,
      consultations: 128,
      rating: 4.7,
      responseTime: 4.2,
      satisfaction: 91,
    },
    {
      id: "op4",
      name: "Elara Mistica",
      revenue: 9600,
      consultations: 119,
      rating: 4.8,
      responseTime: 2.8,
      satisfaction: 93,
    },
  ],

  userBehavior: {
    deviceTypes: [
      { name: "Mobile", value: 65, color: "#8B5CF6" },
      { name: "Desktop", value: 28, color: "#06B6D4" },
      { name: "Tablet", value: 7, color: "#10B981" },
    ],

    timeSlots: [
      { hour: "00-06", consultations: 45 },
      { hour: "06-12", consultations: 234 },
      { hour: "12-18", consultations: 567 },
      { hour: "18-24", consultations: 432 },
    ],

    sessionDuration: [
      { duration: "0-15min", count: 234, percentage: 18.5 },
      { duration: "15-30min", count: 456, percentage: 36.2 },
      { duration: "30-60min", count: 398, percentage: 31.6 },
      { duration: "60min+", count: 172, percentage: 13.7 },
    ],
  },

  financialMetrics: {
    commissionBreakdown: [
      { operator: "Luna Stellare", commission: 30, earnings: 3720, platform: 8680 },
      { operator: "Maestro Cosmos", commission: 35, earnings: 4130, platform: 7670 },
      { operator: "Sage Aurora", commission: 32, earnings: 3264, platform: 6936 },
      { operator: "Elara Mistica", commission: 38, earnings: 3648, platform: 5952 },
    ],

    paymentMethods: [
      { method: "Carta di Credito", percentage: 68, amount: 193630 },
      { method: "PayPal", percentage: 22, amount: 62645 },
      { method: "Bonifico", percentage: 7, amount: 19932 },
      { method: "Altro", percentage: 3, percentage: 8543 },
    ],
  },

  qualityMetrics: {
    satisfactionTrend: [
      { month: "Gen", client: 4.5, operator: 4.2 },
      { month: "Feb", client: 4.6, operator: 4.3 },
      { month: "Mar", client: 4.7, operator: 4.4 },
      { month: "Apr", client: 4.8, operator: 4.5 },
      { month: "Mag", client: 4.7, operator: 4.6 },
      { month: "Giu", client: 4.9, operator: 4.7 },
    ],

    issueResolution: [
      { type: "Tecnici", count: 23, resolved: 21, avgTime: 2.4 },
      { type: "Pagamenti", count: 18, resolved: 17, avgTime: 1.8 },
      { type: "Qualità", count: 12, resolved: 11, avgTime: 3.2 },
      { type: "Account", count: 8, resolved: 8, avgTime: 1.5 },
    ],
  },
}

interface MetricCardProps {
  title: string
  value: string | number
  change?: number
  icon: React.ElementType
  color: string
  subtitle?: string
}

const MetricCard = ({ title, value, change, icon: Icon, color, subtitle }: MetricCardProps) => (
  <Card className="shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-slate-600">{title}</CardTitle>
      <Icon className={`h-5 w-5 ${color}`} />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-slate-800">{value}</div>
      {change !== undefined && (
        <div className="flex items-center text-xs mt-1">
          {change > 0 ? (
            <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
          ) : (
            <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
          )}
          <span className={change > 0 ? "text-green-600" : "text-red-600"}>{Math.abs(change)}% vs mese scorso</span>
        </div>
      )}
      {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
    </CardContent>
  </Card>
)

export default function ComprehensiveAnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState("6months")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isExporting, setIsExporting] = useState(false)
  const [realTimeData, setRealTimeData] = useState<any>(null)

  // Carica dati real-time
  useEffect(() => {
    const loadRealTimeData = () => {
      const commissions = commissionSystem.getAllCommissions()
      const activeSessions = timerBillingSystem.getActiveSessions()

      setRealTimeData({
        commissions,
        activeSessions,
        totalActiveRevenue: activeSessions.reduce((sum, s) => sum + s.totalCost, 0),
      })
    }

    loadRealTimeData()
    const interval = setInterval(loadRealTimeData, 30000) // Aggiorna ogni 30 secondi
    return () => clearInterval(interval)
  }, [])

  const handleExport = async () => {
    setIsExporting(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const exportData = {
      timestamp: new Date().toISOString(),
      timeRange,
      overview: comprehensiveData.overview,
      revenue: comprehensiveData.revenueData,
      categories: comprehensiveData.categoryPerformance,
      operators: comprehensiveData.operatorMetrics,
      realTime: realTimeData,
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `analytics-report-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    setIsExporting(false)
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Analytics Avanzate</h1>
          <p className="text-slate-600 mt-1">Dashboard completa delle performance in tempo reale</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24hours">Ultime 24 ore</SelectItem>
              <SelectItem value="7days">Ultimi 7 giorni</SelectItem>
              <SelectItem value="30days">Ultimi 30 giorni</SelectItem>
              <SelectItem value="6months">Ultimi 6 mesi</SelectItem>
              <SelectItem value="1year">Ultimo anno</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="bg-gradient-to-r from-sky-500 to-cyan-500 text-white"
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? "Esportando..." : "Esporta Report"}
          </Button>
        </div>
      </div>

      {/* Real-time Alert */}
      {realTimeData?.activeSessions.length > 0 && (
        <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-green-500 animate-pulse" />
              <div>
                <p className="font-semibold text-green-700">{realTimeData.activeSessions.length} consulenze attive</p>
                <p className="text-sm text-green-600">
                  Fatturato in corso: €{realTimeData.totalActiveRevenue.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Panoramica</TabsTrigger>
          <TabsTrigger value="revenue">Ricavi</TabsTrigger>
          <TabsTrigger value="operators">Operatori</TabsTrigger>
          <TabsTrigger value="users">Utenti</TabsTrigger>
          <TabsTrigger value="quality">Qualità</TabsTrigger>
          <TabsTrigger value="realtime">Real-time</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Fatturato Totale"
              value={`€${comprehensiveData.overview.totalRevenue.toLocaleString()}`}
              change={comprehensiveData.overview.monthlyGrowth}
              icon={DollarSign}
              color="text-green-500"
              subtitle="Crescita mensile"
            />
            <MetricCard
              title="Consulenze Totali"
              value={comprehensiveData.overview.totalConsultations.toLocaleString()}
              change={12.3}
              icon={MessageSquare}
              color="text-blue-500"
              subtitle="Questo mese"
            />
            <MetricCard
              title="Utenti Attivi"
              value={comprehensiveData.overview.activeUsers.toLocaleString()}
              change={8.7}
              icon={Users}
              color="text-purple-500"
              subtitle="Utenti mensili"
            />
            <MetricCard
              title="Rating Medio"
              value={comprehensiveData.overview.averageRating}
              change={2.1}
              icon={Star}
              color="text-yellow-500"
              subtitle="Su tutte le consulenze"
            />
          </div>

          {/* Additional KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Tasso Conversione"
              value={`${comprehensiveData.overview.conversionRate}%`}
              change={1.8}
              icon={Target}
              color="text-cyan-500"
              subtitle="Visitatori → Clienti"
            />
            <MetricCard
              title="Tasso Abbandono"
              value={`${comprehensiveData.overview.churnRate}%`}
              change={-0.5}
              icon={AlertTriangle}
              color="text-red-500"
              subtitle="Clienti persi"
            />
            <MetricCard
              title="Soddisfazione Operatori"
              value={`${comprehensiveData.overview.operatorSatisfaction}%`}
              change={3.2}
              icon={Heart}
              color="text-pink-500"
              subtitle="Survey mensile"
            />
            <MetricCard
              title="Tempo Risposta Medio"
              value="3.2 min"
              change={-12.5}
              icon={Clock}
              color="text-indigo-500"
              subtitle="Miglioramento"
            />
          </div>

          {/* Overview Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Andamento Generale
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={comprehensiveData.revenueData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.1} />
                      </linearGradient>
                      <linearGradient id="colorConsultations" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#06B6D4"
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                      name="Fatturato (€)"
                    />
                    <Area
                      type="monotone"
                      dataKey="consultations"
                      stroke="#8B5CF6"
                      fillOpacity={1}
                      fill="url(#colorConsultations)"
                      name="Consulenze"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-500" />
                  Performance Categorie
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={comprehensiveData.categoryPerformance}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="revenue"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {comprehensiveData.categoryPerformance.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`hsl(${index * 60}, 70%, 50%)`} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`€${value}`, "Fatturato"]} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle>Andamento Fatturato</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={comprehensiveData.revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#06B6D4" strokeWidth={3} name="Fatturato (€)" />
                    <Line type="monotone" dataKey="consultations" stroke="#8B5CF6" strokeWidth={3} name="Consulenze" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle>Commissioni Operatori</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {comprehensiveData.financialMetrics.commissionBreakdown.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-semibold">{item.operator}</p>
                        <p className="text-sm text-slate-600">Commissione: {item.commission}%</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">€{item.earnings}</p>
                        <p className="text-sm text-slate-500">Piattaforma: €{item.platform}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle>Performance per Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={comprehensiveData.categoryPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="#06B6D4" name="Fatturato (€)" />
                  <Bar dataKey="consultations" fill="#8B5CF6" name="Consulenze" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Operators Tab */}
        <TabsContent value="operators" className="space-y-6">
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle>Performance Operatori</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Operatore</th>
                      <th className="text-center p-3">Fatturato</th>
                      <th className="text-center p-3">Consulenze</th>
                      <th className="text-center p-3">Rating</th>
                      <th className="text-center p-3">Tempo Risposta</th>
                      <th className="text-center p-3">Soddisfazione</th>
                      <th className="text-center p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comprehensiveData.operatorMetrics.map((op, index) => (
                      <tr key={index} className="border-b hover:bg-slate-50">
                        <td className="p-3 font-medium">{op.name}</td>
                        <td className="p-3 text-center font-semibold text-green-600">€{op.revenue}</td>
                        <td className="p-3 text-center">{op.consultations}</td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            {op.rating}
                          </div>
                        </td>
                        <td className="p-3 text-center">{op.responseTime} min</td>
                        <td className="p-3 text-center">
                          <Badge variant={op.satisfaction >= 95 ? "default" : "secondary"}>{op.satisfaction}%</Badge>
                        </td>
                        <td className="p-3 text-center">
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Attivo
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {realTimeData?.commissions && (
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Commissioni Real-time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {realTimeData.commissions.map((commission: any, index: number) => (
                    <div key={index} className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-semibold">Operatore {commission.operatorId}</p>
                        <Badge variant="outline">{commission.currentCommission}%</Badge>
                      </div>
                      <div className="space-y-1 text-sm">
                        <p>Consulenze: {commission.consultationsThisMonth}</p>
                        <p>Guadagni: €{commission.totalEarnings.toFixed(2)}</p>
                        <p>Prossimo bonus: {commission.nextBonusAt} consulenze</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-purple-500" />
                  Dispositivi Utilizzati
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={comprehensiveData.userBehavior.deviceTypes}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {comprehensiveData.userBehavior.deviceTypes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-500" />
                  Orari di Utilizzo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={comprehensiveData.userBehavior.timeSlots}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="consultations" fill="#06B6D4" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle>Durata Sessioni</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {comprehensiveData.userBehavior.sessionDuration.map((item, index) => (
                  <div key={index} className="text-center p-4 bg-slate-50 rounded-lg">
                    <div className="text-2xl font-bold text-slate-800">{item.count}</div>
                    <div className="text-sm text-slate-600">{item.duration}</div>
                    <div className="text-xs text-slate-500">{item.percentage}%</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quality Tab */}
        <TabsContent value="quality" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle>Trend Soddisfazione</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={comprehensiveData.qualityMetrics.satisfactionTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[4, 5]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="client" stroke="#06B6D4" strokeWidth={3} name="Clienti" />
                    <Line type="monotone" dataKey="operator" stroke="#8B5CF6" strokeWidth={3} name="Operatori" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle>Risoluzione Problemi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {comprehensiveData.qualityMetrics.issueResolution.map((issue, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-semibold">{issue.type}</p>
                        <p className="text-sm text-slate-600">
                          {issue.resolved}/{issue.count} risolti
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{issue.avgTime}h</p>
                        <p className="text-sm text-slate-500">Tempo medio</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Real-time Tab */}
        <TabsContent value="realtime" className="space-y-6">
          {realTimeData?.activeSessions && (
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-500 animate-pulse" />
                  Sessioni Attive ({realTimeData.activeSessions.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {realTimeData.activeSessions.length > 0 ? (
                  <div className="space-y-4">
                    {realTimeData.activeSessions.map((session: any, index: number) => (
                      <div key={index} className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold">Sessione {session.id.slice(-8)}</p>
                            <p className="text-sm text-slate-600">
                              Cliente: {session.clientId} → Operatore: {session.operatorId}
                            </p>
                            <p className="text-sm text-slate-600">Durata: {Math.floor(session.duration / 60)} min</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-green-600">€{session.totalCost.toFixed(2)}</p>
                            <p className="text-sm text-slate-500">€{session.ratePerMinute}/min</p>
                            <Badge variant="default" className="bg-green-100 text-green-800 mt-1">
                              {session.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nessuna sessione attiva al momento</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Utenti Online</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{Math.floor(Math.random() * 50) + 20}</div>
                <p className="text-sm text-slate-500">In questo momento</p>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Operatori Disponibili</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{Math.floor(Math.random() * 15) + 8}</div>
                <p className="text-sm text-slate-500">Pronti per consulenze</p>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Fatturato Oggi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">€{(Math.random() * 2000 + 500).toFixed(0)}</div>
                <p className="text-sm text-slate-500">Aggiornato in tempo reale</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
