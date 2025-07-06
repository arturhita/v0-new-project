"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, TrendingUp, Users, Award, Gift, Target, Download, RefreshCw, Filter } from "lucide-react"

export default function GamificationAnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30d")
  const [isLoading, setIsLoading] = useState(false)

  const [analytics, setAnalytics] = useState({
    pointsDistribution: [
      { range: "0-100", users: 234, percentage: 35 },
      { range: "101-500", users: 189, percentage: 28 },
      { range: "501-1000", users: 156, percentage: 23 },
      { range: "1001-2000", users: 67, percentage: 10 },
      { range: "2000+", users: 28, percentage: 4 },
    ],
    badgeStats: [
      { name: "Primo Consulto", unlocked: 456, total: 674, percentage: 68 },
      { name: "Consulente Esperto", unlocked: 89, total: 156, percentage: 57 },
      { name: "Maestro Spirituale", unlocked: 12, total: 156, percentage: 8 },
    ],
    rewardStats: [
      { name: "Consulenza 15min", redeemed: 234, cost: 500, totalPoints: 117000 },
      { name: "Consulenza 30min", redeemed: 89, cost: 1000, totalPoints: 89000 },
      { name: "Boost Visibilità", redeemed: 45, cost: 800, totalPoints: 36000 },
    ],
    engagement: {
      dailyActiveUsers: 892,
      weeklyActiveUsers: 1247,
      monthlyActiveUsers: 1456,
      averageSessionTime: "12m 34s",
      pointsEarnedToday: 2340,
      rewardsRedeemedToday: 23,
    },
  })

  const refreshData = async () => {
    setIsLoading(true)
    // Simula caricamento dati
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <BarChart3 className="w-8 h-8 mr-3 text-sky-400" />
              Analytics Gamification
            </h1>
            <p className="text-white/70 mt-2">Analisi dettagliate del sistema gaming</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={refreshData}
              disabled={isLoading}
              className="bg-gradient-to-r from-green-500 to-emerald-500"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Aggiorna
            </Button>
            <Button className="bg-gradient-to-r from-sky-500 to-cyan-500">
              <Download className="w-4 h-4 mr-2" />
              Esporta Report
            </Button>
          </div>
        </div>

        {/* Time Range Selector */}
        <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-sky-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Filter className="w-5 h-5 text-white/70" />
                <span className="text-white/70">Periodo:</span>
                <div className="flex gap-2">
                  {["7d", "30d", "90d", "1y"].map((range) => (
                    <Button
                      key={range}
                      size="sm"
                      variant={timeRange === range ? "default" : "outline"}
                      onClick={() => setTimeRange(range)}
                      className={
                        timeRange === range
                          ? "bg-sky-500 text-white"
                          : "border-slate-600 text-white/70 hover:text-white"
                      }
                    >
                      {range === "7d"
                        ? "7 giorni"
                        : range === "30d"
                          ? "30 giorni"
                          : range === "90d"
                            ? "3 mesi"
                            : "1 anno"}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="text-white/70 text-sm">Ultimo aggiornamento: {new Date().toLocaleString("it-IT")}</div>
            </div>
          </CardContent>
        </Card>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-400 text-sm font-medium">Utenti Attivi Oggi</p>
                  <p className="text-2xl font-bold text-white">{analytics.engagement.dailyActiveUsers}</p>
                  <p className="text-green-400 text-xs">+12% vs ieri</p>
                </div>
                <Users className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-400 text-sm font-medium">Punti Assegnati Oggi</p>
                  <p className="text-2xl font-bold text-white">{analytics.engagement.pointsEarnedToday}</p>
                  <p className="text-green-400 text-xs">+8% vs ieri</p>
                </div>
                <Target className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-400 text-sm font-medium">Rewards Riscattati</p>
                  <p className="text-2xl font-bold text-white">{analytics.engagement.rewardsRedeemedToday}</p>
                  <p className="text-green-400 text-xs">+15% vs ieri</p>
                </div>
                <Gift className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-400 text-sm font-medium">Tempo Sessione Medio</p>
                  <p className="text-2xl font-bold text-white">{analytics.engagement.averageSessionTime}</p>
                  <p className="text-green-400 text-xs">+5% vs ieri</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Analytics */}
        <Tabs defaultValue="points" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 border border-sky-500/20">
            <TabsTrigger value="points" className="data-[state=active]:bg-sky-500/20">
              <Target className="w-4 h-4 mr-2" />
              Distribuzione Punti
            </TabsTrigger>
            <TabsTrigger value="badges" className="data-[state=active]:bg-sky-500/20">
              <Award className="w-4 h-4 mr-2" />
              Badge Analytics
            </TabsTrigger>
            <TabsTrigger value="rewards" className="data-[state=active]:bg-sky-500/20">
              <Gift className="w-4 h-4 mr-2" />
              Rewards Analytics
            </TabsTrigger>
            <TabsTrigger value="engagement" className="data-[state=active]:bg-sky-500/20">
              <TrendingUp className="w-4 h-4 mr-2" />
              Engagement
            </TabsTrigger>
          </TabsList>

          {/* Points Distribution */}
          <TabsContent value="points">
            <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-sky-500/20">
              <CardHeader>
                <CardTitle className="text-white">Distribuzione Punti Utenti</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.pointsDistribution.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-sky-500/20 to-cyan-500/20 rounded-lg flex items-center justify-center border border-sky-500/30">
                          <span className="text-sky-400 font-bold">{item.range}</span>
                        </div>
                        <div>
                          <p className="text-white font-medium">{item.users} utenti</p>
                          <p className="text-white/70 text-sm">{item.percentage}% del totale</p>
                        </div>
                      </div>
                      <div className="w-32 bg-slate-600 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-sky-500 to-cyan-500 h-3 rounded-full"
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Badge Analytics */}
          <TabsContent value="badges">
            <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-sky-500/20">
              <CardHeader>
                <CardTitle className="text-white">Performance Badge</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.badgeStats.map((badge, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center border border-purple-500/30">
                          <Award className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{badge.name}</p>
                          <p className="text-white/70 text-sm">
                            {badge.unlocked} / {badge.total} utenti ({badge.percentage}%)
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-slate-600 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                            style={{ width: `${badge.percentage}%` }}
                          ></div>
                        </div>
                        <Badge className="bg-purple-500/20 text-purple-400">{badge.percentage}%</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rewards Analytics */}
          <TabsContent value="rewards">
            <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-sky-500/20">
              <CardHeader>
                <CardTitle className="text-white">Performance Rewards</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.rewardStats.map((reward, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg flex items-center justify-center border border-green-500/30">
                          <Gift className="w-6 h-6 text-green-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{reward.name}</p>
                          <p className="text-white/70 text-sm">Riscattato {reward.redeemed} volte</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-yellow-400 font-bold">{reward.cost} punti</p>
                        <p className="text-green-400 text-sm">{reward.totalPoints.toLocaleString()} punti totali</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Engagement Analytics */}
          <TabsContent value="engagement">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-sky-500/20">
                <CardHeader>
                  <CardTitle className="text-white">Utenti Attivi</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-white/70">Giornalieri</span>
                      <span className="text-white font-bold">{analytics.engagement.dailyActiveUsers}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/70">Settimanali</span>
                      <span className="text-white font-bold">{analytics.engagement.weeklyActiveUsers}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/70">Mensili</span>
                      <span className="text-white font-bold">{analytics.engagement.monthlyActiveUsers}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-sky-500/20">
                <CardHeader>
                  <CardTitle className="text-white">Trend Engagement</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                    <p className="text-white/60">Grafico Trend Engagement (Placeholder)</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
