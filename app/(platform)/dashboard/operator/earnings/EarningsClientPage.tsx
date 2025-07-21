"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { TrendingUp, TrendingDown, Coins, Calendar, Clock, Sparkles, Star, Zap } from "lucide-react"
import type { User } from "@supabase/supabase-js"
import type { EarningsSummary, ChartDataPoint, Transaction } from "@/lib/actions/earnings.actions"
import { formatCurrency, formatDate, getServiceTypeLabel, getServiceTypeIcon } from "@/lib/actions/earnings.actions"

interface EarningsClientPageProps {
  user: User
  initialSummary: EarningsSummary
  initialChartData: ChartDataPoint[]
  initialTransactions: Transaction[]
}

export default function EarningsClientPage({
  user,
  initialSummary,
  initialChartData,
  initialTransactions,
}: EarningsClientPageProps) {
  const getGrowthIcon = (rate: number) => {
    if (rate > 0) return <TrendingUp className="w-4 h-4 text-green-400" />
    if (rate < 0) return <TrendingDown className="w-4 h-4 text-red-400" />
    return <Zap className="w-4 h-4 text-yellow-400" />
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: "bg-green-500/20 text-green-400 border-green-500/30",
      pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
    }
    return variants[status as keyof typeof variants] || variants.completed
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Mystical Background Effects */}
      <div className="absolute inset-0 bg-[url('/placeholder.svg?height=1080&width=1920')] opacity-5"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>

      <div className="relative z-10 p-6 space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 mb-2 flex items-center justify-center">
            <Coins className="w-10 h-10 mr-4 text-yellow-400" />
            Tesoro Astrale
            <Sparkles className="w-8 h-8 ml-4 text-yellow-400" />
          </h1>
          <p className="text-blue-200 text-lg">I tuoi guadagni cosmici e le energie monetarie</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="backdrop-blur-xl bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 shadow-2xl rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-yellow-100">Tesoro Totale</CardTitle>
              <Star className="h-5 w-5 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-300">{formatCurrency(initialSummary.totalEarnings)}</div>
              <p className="text-xs text-yellow-200/70 mt-1">{initialSummary.totalConsultations} consulenze totali</p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 shadow-2xl rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-100">Luna Corrente</CardTitle>
              <Calendar className="h-5 w-5 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-300">{formatCurrency(initialSummary.monthlyEarnings)}</div>
              <div className="flex items-center text-xs text-blue-200/70 mt-1">
                {getGrowthIcon(initialSummary.monthlyGrowthRate)}
                <span className="ml-1">
                  {initialSummary.monthlyGrowthRate > 0 ? "+" : ""}
                  {initialSummary.monthlyGrowthRate.toFixed(1)}% vs mese scorso
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 shadow-2xl rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-100">Settimana Stellare</CardTitle>
              <Clock className="h-5 w-5 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-300">{formatCurrency(initialSummary.weeklyEarnings)}</div>
              <p className="text-xs text-purple-200/70 mt-1">
                {initialSummary.weeklyConsultations} consulenze questa settimana
              </p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-xl bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 border border-indigo-500/30 shadow-2xl rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-indigo-100">Energia Oggi</CardTitle>
              <Sparkles className="h-5 w-5 text-indigo-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-300">{formatCurrency(initialSummary.dailyEarnings)}</div>
              <p className="text-xs text-indigo-200/70 mt-1">{initialSummary.dailyConsultations} consulenze oggi</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="earnings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white/10 backdrop-blur-sm border border-white/20">
            <TabsTrigger value="earnings" className="data-[state=active]:bg-blue-500/30 text-white">
              Andamento Guadagni
            </TabsTrigger>
            <TabsTrigger value="consultations" className="data-[state=active]:bg-purple-500/30 text-white">
              Consulenze per Giorno
            </TabsTrigger>
          </TabsList>

          <TabsContent value="earnings">
            <Card className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-blue-400" />
                  Guadagni Ultimi 30 Giorni
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={initialChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis
                      dataKey="date"
                      stroke="rgba(255,255,255,0.7)"
                      fontSize={12}
                      tickFormatter={(value) =>
                        new Date(value).toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit" })
                      }
                    />
                    <YAxis stroke="rgba(255,255,255,0.7)" fontSize={12} tickFormatter={(value) => `€${value}`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(0,0,0,0.8)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        borderRadius: "8px",
                        color: "white",
                      }}
                      formatter={(value: number) => [formatCurrency(value), "Guadagni"]}
                      labelFormatter={(label) => new Date(label).toLocaleDateString("it-IT")}
                    />
                    <Line
                      type="monotone"
                      dataKey="earnings"
                      stroke="#3B82F6"
                      strokeWidth={3}
                      dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: "#3B82F6", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="consultations">
            <Card className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-purple-400" />
                  Consulenze per Giorno
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={initialChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis
                      dataKey="date"
                      stroke="rgba(255,255,255,0.7)"
                      fontSize={12}
                      tickFormatter={(value) =>
                        new Date(value).toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit" })
                      }
                    />
                    <YAxis stroke="rgba(255,255,255,0.7)" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(0,0,0,0.8)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        borderRadius: "8px",
                        color: "white",
                      }}
                      formatter={(value: number) => [value, "Consulenze"]}
                      labelFormatter={(label) => new Date(label).toLocaleDateString("it-IT")}
                    />
                    <Bar dataKey="consultations" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Recent Transactions */}
        <Card className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Coins className="w-5 h-5 mr-2 text-yellow-400" />
              Transazioni Recenti
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {initialTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all duration-300 border border-white/10"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">{getServiceTypeIcon(transaction.serviceType)}</div>
                    <div>
                      <p className="font-semibold text-white">{getServiceTypeLabel(transaction.serviceType)}</p>
                      <p className="text-sm text-white/70">{formatDate(transaction.createdAt)}</p>
                      {transaction.durationMinutes && (
                        <p className="text-xs text-white/50">Durata: {transaction.durationMinutes} minuti</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={getStatusBadge(transaction.status)}>
                        {transaction.status === "completed"
                          ? "Completato"
                          : transaction.status === "pending"
                            ? "In Attesa"
                            : "Annullato"}
                      </Badge>
                    </div>
                    <p className="font-bold text-green-400">{formatCurrency(transaction.netAmount)}</p>
                    <p className="text-xs text-white/50">Lordo: {formatCurrency(transaction.grossAmount)}</p>
                    <p className="text-xs text-red-300">Commissione: -{formatCurrency(transaction.commissionAmount)}</p>
                  </div>
                </div>
              ))}
              {initialTransactions.length === 0 && (
                <div className="text-center py-8">
                  <Sparkles className="w-12 h-12 mx-auto text-white/30 mb-4" />
                  <p className="text-white/60">Nessuna transazione ancora registrata</p>
                  <p className="text-white/40 text-sm mt-2">Le tue future consulenze appariranno qui</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
