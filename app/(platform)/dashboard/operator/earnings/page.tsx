import { Suspense } from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  getOperatorEarningsSummary,
  getOperatorEarningsChartData,
  getOperatorRecentTransactions,
  formatCurrency,
  formatServiceType,
  formatDuration,
  calculateGrowthPercentage,
} from "@/lib/actions/earnings.actions"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import { TrendingUp, TrendingDown, Euro, Calendar, Clock, Users, Sparkles, Star, Moon, Zap } from "lucide-react"

async function EarningsContent() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

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
      <div className="text-center py-12">
        <p className="text-muted-foreground">Errore nel caricamento dei dati</p>
      </div>
    )
  }

  // Calculate previous month earnings for growth percentage
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const previousMonthData = chartData.filter((item) => {
    const itemDate = new Date(item.date)
    const itemMonth = itemDate.getMonth()
    const itemYear = itemDate.getFullYear()

    if (currentMonth === 0) {
      return itemMonth === 11 && itemYear === currentYear - 1
    }
    return itemMonth === currentMonth - 1 && itemYear === currentYear
  })

  const previousMonthEarnings = previousMonthData.reduce((sum, item) => sum + item.earnings, 0)
  const growthPercentage = calculateGrowthPercentage(summary.monthlyEarnings, previousMonthEarnings)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-8 text-white">
        <div className="absolute inset-0 bg-[url('/images/constellation-bg.png')] opacity-20" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Tesoro Astrale</h1>
              <p className="text-blue-200">I tuoi guadagni e statistiche mistiche</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-yellow-300">
            <Star className="h-5 w-5" />
            <span className="text-lg font-semibold">Guadagni totali: {formatCurrency(summary.totalEarnings)}</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Oggi</CardTitle>
            <Moon className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{formatCurrency(summary.dailyEarnings)}</div>
            <p className="text-xs text-blue-600 mt-1">{summary.dailyConsultations} consulenze</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-violet-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Questa Settimana</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{formatCurrency(summary.weeklyEarnings)}</div>
            <p className="text-xs text-purple-600 mt-1">{summary.weeklyConsultations} consulenze</p>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-700">Questo Mese</CardTitle>
            <Euro className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-900">{formatCurrency(summary.monthlyEarnings)}</div>
            <div className="flex items-center gap-1 mt-1">
              {growthPercentage >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-600" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600" />
              )}
              <p className={`text-xs ${growthPercentage >= 0 ? "text-green-600" : "text-red-600"}`}>
                {growthPercentage >= 0 ? "+" : ""}
                {growthPercentage.toFixed(1)}% vs mese scorso
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-700">Totale</CardTitle>
            <Zap className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-900">{formatCurrency(summary.totalEarnings)}</div>
            <p className="text-xs text-emerald-600 mt-1">{summary.totalConsultations} consulenze totali</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Andamento Guadagni (30 giorni)
            </CardTitle>
            <CardDescription>Evoluzione dei tuoi guadagni negli ultimi 30 giorni</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit" })
                    }
                  />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `€${value}`} />
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), "Guadagni"]}
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
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              Consulenze per Giorno
            </CardTitle>
            <CardDescription>Numero di consulenze completate negli ultimi 30 giorni</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit" })
                    }
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value: number) => [value, "Consulenze"]}
                    labelFormatter={(label) => new Date(label).toLocaleDateString("it-IT")}
                  />
                  <Bar dataKey="consultations" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-600" />
            Transazioni Recenti
          </CardTitle>
          <CardDescription>Le tue ultime consulenze e guadagni</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
                <Sparkles className="h-12 w-12 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Nessuna transazione ancora</h3>
              <p className="text-gray-600">Le tue prime consulenze appariranno qui</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-gradient-to-r from-gray-50 to-blue-50 hover:from-blue-50 hover:to-purple-50 transition-all duration-200"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500">
                      {transaction.serviceType === "chat" && <Users className="h-4 w-4 text-white" />}
                      {transaction.serviceType === "call" && <Clock className="h-4 w-4 text-white" />}
                      {transaction.serviceType === "written" && <Star className="h-4 w-4 text-white" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          {formatServiceType(transaction.serviceType)}
                        </Badge>
                        {transaction.durationMinutes && (
                          <span className="text-sm text-gray-600">{formatDuration(transaction.durationMinutes)}</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
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
                    <div className="font-semibold text-green-700">{formatCurrency(transaction.netAmount)}</div>
                    <div className="text-xs text-gray-500">Lordo: {formatCurrency(transaction.grossAmount)}</div>
                    <div className="text-xs text-gray-500">
                      Commissione: {formatCurrency(transaction.platformCommission)}
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
    <div className="space-y-8">
      {/* Header Skeleton */}
      <div className="rounded-lg bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-8">
        <Skeleton className="h-8 w-64 mb-4 bg-white/20" />
        <Skeleton className="h-6 w-48 bg-white/20" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-20" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-24 mb-2" />
              <Skeleton className="h-3 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
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

      {/* Transactions Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
                <div className="text-right">
                  <Skeleton className="h-5 w-16 mb-1" />
                  <Skeleton className="h-3 w-20" />
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
    <div className="container mx-auto p-6">
      <Suspense fallback={<EarningsLoading />}>
        <EarningsContent />
      </Suspense>
    </div>
  )
}
