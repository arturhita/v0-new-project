import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import {
  getOperatorEarningsSummary,
  getOperatorEarningsChartData,
  getOperatorRecentTransactions,
  formatCurrency,
  getServiceTypeDisplayName,
  calculateGrowthPercentage,
} from "@/lib/actions/earnings.actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Clock,
  MessageCircle,
  Phone,
  Mail,
  BarChart3,
  Coins,
} from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"

async function EarningsContent() {
  const supabase = createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect("/login")
  }

  // Get operator profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile || profile.role !== "operator") {
    redirect("/dashboard/client")
  }

  // Fetch all earnings data
  const [summary, chartData, transactions] = await Promise.all([
    getOperatorEarningsSummary(user.id),
    getOperatorEarningsChartData(user.id, 30),
    getOperatorRecentTransactions(user.id, 15),
  ])

  if (!summary) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Errore nel caricamento dei dati dei guadagni.</p>
      </div>
    )
  }

  // Calculate growth percentages (comparing current month with previous period)
  const previousMonthData = chartData.slice(-60, -30) // Previous 30 days
  const currentMonthData = chartData.slice(-30) // Last 30 days

  const previousMonthTotal = previousMonthData.reduce((sum, item) => sum + item.earnings, 0)
  const monthlyGrowth = calculateGrowthPercentage(summary.monthlyEarnings, previousMonthTotal)

  const getServiceIcon = (serviceType: string) => {
    switch (serviceType) {
      case "chat":
        return <MessageCircle className="h-4 w-4" />
      case "call":
        return <Phone className="h-4 w-4" />
      case "written":
        return <Mail className="h-4 w-4" />
      default:
        return <DollarSign className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">💰 Tesoro Astrale</h1>
        <p className="text-blue-200">Monitora i tuoi guadagni e l'andamento delle tue consulenze spirituali</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-900/50 to-slate-800/50 border-blue-700/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-200">Guadagni Totali</CardTitle>
            <Coins className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{formatCurrency(summary.totalEarnings)}</div>
            <p className="text-xs text-blue-300">{summary.totalConsultations} consulenze totali</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-900/50 to-slate-800/50 border-blue-700/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-200">Questo Mese</CardTitle>
            <Calendar className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{formatCurrency(summary.monthlyEarnings)}</div>
            <div className="flex items-center text-xs">
              {monthlyGrowth >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-400 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-400 mr-1" />
              )}
              <span className={monthlyGrowth >= 0 ? "text-green-400" : "text-red-400"}>
                {Math.abs(monthlyGrowth).toFixed(1)}%
              </span>
              <span className="text-blue-300 ml-1">vs mese scorso</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-900/50 to-slate-800/50 border-blue-700/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-200">Questa Settimana</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{formatCurrency(summary.weeklyEarnings)}</div>
            <p className="text-xs text-blue-300">{summary.weeklyConsultations} consulenze</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-900/50 to-slate-800/50 border-blue-700/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-200">Oggi</CardTitle>
            <Clock className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{formatCurrency(summary.dailyEarnings)}</div>
            <p className="text-xs text-blue-300">{summary.dailyConsultations} consulenze oggi</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Earnings Chart */}
        <Card className="bg-gradient-to-br from-blue-900/50 to-slate-800/50 border-blue-700/50">
          <CardHeader>
            <CardTitle className="text-white">Andamento Guadagni (30 giorni)</CardTitle>
            <CardDescription className="text-blue-300">Guadagni giornalieri degli ultimi 30 giorni</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="date"
                  stroke="#9CA3AF"
                  fontSize={12}
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit" })
                  }
                />
                <YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={(value) => `€${value}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #475569",
                    borderRadius: "8px",
                    color: "#f1f5f9",
                  }}
                  formatter={(value: any) => [formatCurrency(Number(value)), "Guadagni"]}
                  labelFormatter={(label) => new Date(label).toLocaleDateString("it-IT")}
                />
                <Line
                  type="monotone"
                  dataKey="earnings"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: "#3b82f6", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Consultations Chart */}
        <Card className="bg-gradient-to-br from-blue-900/50 to-slate-800/50 border-blue-700/50">
          <CardHeader>
            <CardTitle className="text-white">Consulenze per Giorno</CardTitle>
            <CardDescription className="text-blue-300">Numero di consulenze completate giornalmente</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="date"
                  stroke="#9CA3AF"
                  fontSize={12}
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit" })
                  }
                />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #475569",
                    borderRadius: "8px",
                    color: "#f1f5f9",
                  }}
                  formatter={(value: any) => [value, "Consulenze"]}
                  labelFormatter={(label) => new Date(label).toLocaleDateString("it-IT")}
                />
                <Bar dataKey="consultations" fill="#10b981" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="bg-gradient-to-br from-blue-900/50 to-slate-800/50 border-blue-700/50">
        <CardHeader>
          <CardTitle className="text-white">Transazioni Recenti</CardTitle>
          <CardDescription className="text-blue-300">Le tue ultime consulenze e relativi guadagni</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-blue-300">Nessuna transazione trovata.</p>
              <p className="text-sm text-blue-400 mt-2">
                I tuoi guadagni appariranno qui dopo aver completato delle consulenze.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700/50"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-2 rounded-full bg-blue-900/50">{getServiceIcon(transaction.serviceType)}</div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-white">
                          {getServiceTypeDisplayName(transaction.serviceType)}
                        </span>
                        {transaction.durationMinutes && (
                          <Badge variant="secondary" className="text-xs">
                            {transaction.durationMinutes} min
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-blue-300">
                        {new Date(transaction.createdAt).toLocaleDateString("it-IT", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-400">{formatCurrency(transaction.netAmount)}</div>
                    <div className="text-xs text-blue-400">Lordo: {formatCurrency(transaction.grossAmount)}</div>
                    <div className="text-xs text-red-400">
                      Commissione: -{formatCurrency(transaction.platformCommission)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function EarningsLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="bg-gradient-to-br from-blue-900/50 to-slate-800/50 border-blue-700/50">
            <CardHeader className="space-y-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i} className="bg-gradient-to-br from-blue-900/50 to-slate-800/50 border-blue-700/50">
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-gradient-to-br from-blue-900/50 to-slate-800/50 border-blue-700/50">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
                <div className="text-right">
                  <Skeleton className="h-5 w-16 mb-1" />
                  <Skeleton className="h-3 w-20 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function EarningsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <Suspense fallback={<EarningsLoading />}>
          <EarningsContent />
        </Suspense>
      </div>
    </div>
  )
}
