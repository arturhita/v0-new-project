"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Target, TrendingUp, Calendar, Euro, Star, Zap, Crown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function RewardsPage() {
  const [currentMonth] = useState("Dicembre 2024")
  const [consultantName] = useState("Luna Stellare") // Dovrebbe venire dal profilo
  const { toast } = useToast()

  // Dati consulente corrente (simulati - dovrebbero venire dal backend)
  const consultantStats = {
    totalEarnings: 2847.5, // Guadagni lordi del consulente
    consultantCommission: 1993.25, // 70% al consulente
    companyRevenue: 854.25, // 30% all'azienda (questo conta per i premi)
    consultationsCount: 89,
    averageRating: 4.9,
    monthlyGrowth: 18.5,
  }

  // Obiettivi premi mensili
  const rewardTiers = [
    {
      id: 1,
      name: "Stella Nascente",
      target: 8000,
      bonus: 5,
      icon: Star,
      color: "from-blue-500 to-cyan-500",
      description: "Raggiungi €8.000 di fatturato aziendale",
    },
    {
      id: 2,
      name: "Maestro Supremo",
      target: 140000,
      bonus: 10,
      icon: Crown,
      color: "from-purple-500 to-pink-500",
      description: "Raggiungi €140.000 di fatturato aziendale",
    },
  ]

  // Storico premi (simulato)
  const rewardHistory = [
    {
      month: "Novembre 2024",
      companyRevenue: 9240.75,
      rewardEarned: "Stella Nascente",
      bonusPercentage: 5,
      bonusAmount: 462.04,
      consultations: 156,
    },
    {
      month: "Ottobre 2024",
      companyRevenue: 6890.3,
      rewardEarned: null,
      bonusPercentage: 0,
      bonusAmount: 0,
      consultations: 134,
    },
    {
      month: "Settembre 2024",
      companyRevenue: 11567.8,
      rewardEarned: "Stella Nascente",
      bonusPercentage: 5,
      bonusAmount: 578.39,
      consultations: 189,
    },
  ]

  // Calcola progresso verso gli obiettivi
  const calculateProgress = (target: number) => {
    return Math.min((consultantStats.companyRevenue / target) * 100, 100)
  }

  // Calcola bonus potenziale
  const calculatePotentialBonus = (target: number, bonus: number) => {
    if (consultantStats.companyRevenue >= target) {
      return (consultantStats.companyRevenue * bonus) / 100
    }
    return 0
  }

  // Determina premio corrente
  const getCurrentReward = () => {
    if (consultantStats.companyRevenue >= 140000) {
      return rewardTiers[1]
    } else if (consultantStats.companyRevenue >= 8000) {
      return rewardTiers[0]
    }
    return null
  }

  const currentReward = getCurrentReward()

  // Calcola quanto manca al prossimo obiettivo
  const getNextTarget = () => {
    if (consultantStats.companyRevenue < 8000) {
      return { target: 8000, missing: 8000 - consultantStats.companyRevenue, tier: rewardTiers[0] }
    } else if (consultantStats.companyRevenue < 140000) {
      return { target: 140000, missing: 140000 - consultantStats.companyRevenue, tier: rewardTiers[1] }
    }
    return null
  }

  const nextTarget = getNextTarget()

  return (
    <div className="space-y-6 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            🏆 Sistema Premi Mensili
          </h2>
          <p className="text-muted-foreground">Raggiungi gli obiettivi e ottieni bonus esclusivi!</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Mese Corrente</p>
          <p className="text-lg font-semibold">{currentMonth}</p>
        </div>
      </div>

      {/* Premio Corrente */}
      {currentReward && (
        <Card className="border-0 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 text-white shadow-2xl">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <currentReward.icon className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">🎉 Congratulazioni!</h3>
                  <p className="text-lg">Hai raggiunto il premio "{currentReward.name}"</p>
                  <p className="text-sm opacity-90">Bonus del {currentReward.bonus}% sui tuoi guadagni questo mese!</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">
                  +€{calculatePotentialBonus(currentReward.target, currentReward.bonus).toFixed(2)}
                </div>
                <div className="text-sm opacity-90">Bonus Guadagnato</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistiche Mensili */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fatturato Aziendale</CardTitle>
            <Euro className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">€{consultantStats.companyRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">30% delle tue consulenze</p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tuoi Guadagni</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">€{consultantStats.consultantCommission.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">70% delle tue consulenze</p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consulenze</CardTitle>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{consultantStats.consultationsCount}</div>
            <p className="text-xs text-muted-foreground">+{consultantStats.monthlyGrowth}% dal mese scorso</p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rating Medio</CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{consultantStats.averageRating}</div>
            <p className="text-xs text-muted-foreground">Eccellente qualità</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="current" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="current">Obiettivi Correnti</TabsTrigger>
          <TabsTrigger value="progress">Progresso</TabsTrigger>
          <TabsTrigger value="history">Storico Premi</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {rewardTiers.map((tier) => {
              const progress = calculateProgress(tier.target)
              const potentialBonus = calculatePotentialBonus(tier.target, tier.bonus)
              const isAchieved = progress >= 100

              return (
                <Card key={tier.id} className={`border-0 bg-gradient-to-r ${tier.color} text-white shadow-lg`}>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <tier.icon className="h-6 w-6" />
                      <span>{tier.name}</span>
                      {isAchieved && <Badge className="bg-white/20 text-white">✅ RAGGIUNTO</Badge>}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm opacity-90">{tier.description}</p>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progresso</span>
                        <span>{progress.toFixed(1)}%</span>
                      </div>
                      <Progress value={progress} className="bg-white/20" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="opacity-75">Obiettivo</p>
                        <p className="font-bold">€{tier.target.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="opacity-75">Bonus {tier.bonus}%</p>
                        <p className="font-bold">
                          {isAchieved
                            ? `+€${potentialBonus.toFixed(2)}`
                            : `€${((tier.target * tier.bonus) / 100).toFixed(2)} max`}
                        </p>
                      </div>
                    </div>

                    {!isAchieved && (
                      <div className="text-sm opacity-90">
                        <p>
                          Ti mancano €{(tier.target - consultantStats.companyRevenue).toFixed(2)} per raggiungere questo
                          premio!
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {nextTarget && (
            <Card className="border-0 bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Zap className="h-8 w-8" />
                    <div>
                      <h3 className="text-xl font-bold">🎯 Prossimo Obiettivo</h3>
                      <p>
                        "{nextTarget.tier.name}" - Bonus {nextTarget.tier.bonus}%
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">€{nextTarget.missing.toFixed(2)}</div>
                    <div className="text-sm opacity-90">ancora da fatturare</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Progresso Dettagliato
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {rewardTiers.map((tier) => {
                const progress = calculateProgress(tier.target)
                const isAchieved = progress >= 100

                return (
                  <div key={tier.id} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <tier.icon className={`h-6 w-6 ${isAchieved ? "text-green-600" : "text-gray-400"}`} />
                        <div>
                          <h4 className="font-semibold">{tier.name}</h4>
                          <p className="text-sm text-muted-foreground">Bonus {tier.bonus}%</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">
                          €{consultantStats.companyRevenue.toFixed(2)} / €{tier.target.toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">{progress.toFixed(1)}% completato</p>
                      </div>
                    </div>
                    <Progress value={progress} className="h-3" />
                    {isAchieved && (
                      <div className="flex items-center space-x-2 text-green-600">
                        <Trophy className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          Premio raggiunto! +€{calculatePotentialBonus(tier.target, tier.bonus).toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Storico Premi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rewardHistory.map((record, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          record.rewardEarned ? "bg-gradient-to-r from-yellow-400 to-orange-400" : "bg-gray-200"
                        }`}
                      >
                        {record.rewardEarned ? (
                          <Trophy className="h-6 w-6 text-white" />
                        ) : (
                          <Calendar className="h-6 w-6 text-gray-500" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold">{record.month}</h4>
                        <p className="text-sm text-muted-foreground">
                          {record.consultations} consulenze • €{record.companyRevenue.toFixed(2)} fatturato aziendale
                        </p>
                        {record.rewardEarned && (
                          <Badge className="mt-1 bg-yellow-100 text-yellow-800">🏆 {record.rewardEarned}</Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      {record.bonusAmount > 0 ? (
                        <>
                          <div className="text-lg font-bold text-green-600">+€{record.bonusAmount.toFixed(2)}</div>
                          <div className="text-sm text-muted-foreground">Bonus {record.bonusPercentage}%</div>
                        </>
                      ) : (
                        <div className="text-sm text-muted-foreground">Nessun premio</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
