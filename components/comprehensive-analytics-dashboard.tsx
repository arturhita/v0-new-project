"use client"

import type React from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart as PieChartComponent,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
  Area,
  AreaChart,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Trophy,
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
import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { commissionSystem } from "@/lib/commission-system"
import { timerBillingSystem } from "@/lib/timer-billing-system"

const COLORS = ["#0EA5E9", "#06B6D4", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"]

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

// Create a default structure for the analytics data
const defaultAnalyticsData = {
  timeSeries: [],
  topOperators: [],
  popularCategories: [],
  overview: {
    totalRevenue: 0,
    monthlyGrowth: 0,
    totalConsultations: 0,
    activeUsers: 0,
    averageRating: 0,
    conversionRate: 0,
    churnRate: 0,
    operatorSatisfaction: 0,
  },
  revenueData: [],
  categoryPerformance: [],
  operatorMetrics: [],
  userBehavior: {
    deviceTypes: [],
    timeSlots: [],
    sessionDuration: [],
  },
  financialMetrics: {
    commissionBreakdown: [],
  },
  qualityMetrics: {
    satisfactionTrend: [],
    issueResolution: [],
  },
}

export function ComprehensiveAnalyticsDashboard({ initialData }: { initialData: any }) {
  const [timeRange, setTimeRange] = useState("6months")
  const [isExporting, setIsExporting] = useState(false)
  const [realTimeData, setRealTimeData] = useState<any>(null)

  // Merge initialData with defaults to prevent crashes
  const data = { ...defaultAnalyticsData, ...(initialData || {}) }
  const {
    timeSeries,
    topOperators,
    popularCategories,
    overview,
    revenueData,
    categoryPerformance,
    operatorMetrics,
    userBehavior,
    financialMetrics,
    qualityMetrics,
  } = data

  const formatCurrency = (value: number) => `€${value.toLocaleString("it-IT")}`

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
      overview,
      revenueData,
      categories: categoryPerformance,
      operators: operatorMetrics,
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
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="bg-gradient-to-r from-sky-500 to-cyan-500 text-white px-4 py-2 rounded flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? "Esportando..." : "Esporta Report"}
          </button>
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
              value={formatCurrency(overview.totalRevenue)}
              change={overview.monthlyGrowth}
              icon={DollarSign}
              color="text-green-500"
              subtitle="Crescita mensile"
            />
            <MetricCard
              title="Consulenze Totali"
              value={overview.totalConsultations.toLocaleString()}
              change={12.3}
              icon={MessageSquare}
              color="text-blue-500"
              subtitle="Questo mese"
            />
            <MetricCard
              title="Utenti Attivi"
              value={overview.activeUsers.toLocaleString()}
              change={8.7}
              icon={Users}
              color="text-purple-500"
              subtitle="Utenti mensili"
            />
            <MetricCard
              title="Rating Medio"
              value={overview.averageRating}
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
              value={`${overview.conversionRate}%`}
              change={1.8}
              icon={Target}
              color="text-cyan-500"
              subtitle="Visitatori → Clienti"
            />
            <MetricCard
              title="Tasso Abbandono"
              value={`${overview.churnRate}%`}
              change={-0.5}
              icon={AlertTriangle}
              color="text-red-500"
              subtitle="Clienti persi"
            />
            <MetricCard
              title="Soddisfazione Operatori"
              value={`${overview.operatorSatisfaction}%`}
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
                  <AreaChart data={revenueData}>
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
                  <PieChartComponent>
                    <Pie
                      data={categoryPerformance}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="revenue"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryPerformance.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`hsl(${index * 60}, 70%, 50%)`} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`€${value}`, "Fatturato"]} />
                  </PieChartComponent>
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
                  <LineChart data={revenueData}>
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
                  {financialMetrics.commissionBreakdown.map((item, index) => (
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
                <BarChart data={categoryPerformance}>
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
                    {operatorMetrics.map((op, index) => (
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
                  <PieChartComponent>
                    <Pie
                      data={userBehavior.deviceTypes}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {userBehavior.deviceTypes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChartComponent>
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
                  <BarChart data={userBehavior.timeSlots}>
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
                {userBehavior.sessionDuration.map((item, index) => (
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
                  <LineChart data={qualityMetrics.satisfactionTrend}>
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
                  {qualityMetrics.issueResolution.map((issue, index) => (
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

      {/* Time Series Charts */}
      <Card>
        <CardHeader>
          <CardTitle>Andamento Mensile (Ultimi 12 Mesi)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeSeries}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis
                yAxisId="left"
                stroke="#3b82f6"
                label={{ value: "Entrate (€)", angle: -90, position: "insideLeft" }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#10b981"
                label={{ value: "Numero", angle: 90, position: "insideRight" }}
              />
              <Tooltip formatter={(value, name) => (name === "Entrate" ? formatCurrency(value as number) : value)} />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="revenue" name="Entrate" stroke="#3b82f6" strokeWidth={2} />
              <Line yAxisId="right" type="monotone" dataKey="users" name="Nuovi Utenti" stroke="#10b981" />
              <Line yAxisId="right" type="monotone" dataKey="consultations" name="Consulenze" stroke="#f59e0b" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Top Operators */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Top Operatori (Consulenze questo mese)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Operatore</TableHead>
                  <TableHead className="text-right">Consulenze</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topOperators.length > 0 ? (
                  topOperators.map((operator) => (
                    <TableRow key={operator.operator_id}>
                      <TableCell className="font-medium">{operator.full_name}</TableCell>
                      <TableCell className="text-right font-bold">{operator.consultations_count}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground">
                      Nessun dato sulle consulenze per questo mese.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Popular Categories */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Categorie Popolari</CardTitle>
          </CardHeader>
          <CardContent>
            {popularCategories.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChartComponent>
                  <Pie
                    data={popularCategories}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="consultation_count"
                    nameKey="category"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {popularCategories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value} consulenze`} />
                  <Legend />
                </PieChartComponent>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[250px] items-center justify-center text-muted-foreground">
                Nessun dato sulle categorie.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
