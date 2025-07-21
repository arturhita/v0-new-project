"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Trophy,
  Star,
  Gift,
  TrendingUp,
  Crown,
  Zap,
  Target,
  Award,
  Sparkles,
  Medal,
  Flame,
  Diamond,
} from "lucide-react"
import { PointsService, LEVELS_CONFIG } from "@/lib/gamification/points-system"
import { BadgesService, BADGES_CATALOG } from "@/lib/gamification/badges-system"
import { RewardsService } from "@/lib/gamification/rewards-system"
import { OperatorBadgesService } from "@/lib/gamification/operator-badges"

export default function GamificationDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [userPoints, setUserPoints] = useState<any>(null)
  const [userBadges, setUserBadges] = useState<any[]>([])
  const [userRewards, setUserRewards] = useState<any[]>([])
  const [operatorBadges, setOperatorBadges] = useState<any>(null)

  useEffect(() => {
    loadGamificationData()
  }, [])

  const loadGamificationData = async () => {
    const userId = "current_user"
    const userType = "client" // Determina dal context

    if (userType === "client") {
      const [points, badges, rewards] = await Promise.all([
        PointsService.getUserPoints(userId),
        BadgesService.getUserBadges(userId),
        RewardsService.getUserRewards(userId),
      ])

      setUserPoints(points)
      setUserBadges(badges)
      setUserRewards(rewards)
    } else {
      // Per operatori, carica badge basati su consulti
      const totalConsults = Math.floor(Math.random() * 200) + 5
      const unlockedBadges = OperatorBadgesService.getUnlockedBadges(totalConsults)
      const progress = OperatorBadgesService.getBadgeProgress(totalConsults)

      setOperatorBadges({
        totalConsults,
        unlockedBadges,
        progress,
        points: totalConsults * 100,
      })
    }
  }

  const currentLevel = LEVELS_CONFIG.find((l) => l.level === userPoints?.level) || LEVELS_CONFIG[0]
  const nextLevel = LEVELS_CONFIG.find((l) => l.level === (userPoints?.level || 1) + 1)
  const progressToNext = nextLevel ? ((userPoints?.xp || 0) / nextLevel.xpRequired) * 100 : 100

  const rarityColors = {
    common: "border-gray-400 bg-gray-50",
    rare: "border-blue-400 bg-blue-50",
    epic: "border-purple-400 bg-purple-50",
    legendary: "border-yellow-400 bg-yellow-50",
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center">
            <Trophy className="w-8 h-8 mr-3 text-yellow-400" />
            Centro Gamification
          </h1>
          <p className="text-white/70 text-lg">Accumula punti, sblocca badge e riscatta premi!</p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30">
            <CardContent className="p-6 text-center">
              <Sparkles className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
              <div className="text-2xl font-bold text-white">{userPoints?.availablePoints || 0}</div>
              <div className="text-sm text-white/70">Punti Disponibili</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
            <CardContent className="p-6 text-center">
              <Crown className="w-8 h-8 mx-auto mb-2 text-purple-400" />
              <div className="text-2xl font-bold text-white">Livello {userPoints?.level || 1}</div>
              <div className="text-sm text-white/70">{currentLevel.title}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30">
            <CardContent className="p-6 text-center">
              <Award className="w-8 h-8 mx-auto mb-2 text-blue-400" />
              <div className="text-2xl font-bold text-white">{userBadges.length}</div>
              <div className="text-sm text-white/70">Badge Sbloccati</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30">
            <CardContent className="p-6 text-center">
              <Gift className="w-8 h-8 mx-auto mb-2 text-green-400" />
              <div className="text-2xl font-bold text-white">{userRewards.length}</div>
              <div className="text-sm text-white/70">Rewards Attivi</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 border border-sky-500/20">
            <TabsTrigger value="overview" className="data-[state=active]:bg-sky-500/20">
              <TrendingUp className="w-4 h-4 mr-2" />
              Panoramica
            </TabsTrigger>
            <TabsTrigger value="badges" className="data-[state=active]:bg-sky-500/20">
              <Medal className="w-4 h-4 mr-2" />
              Badge
            </TabsTrigger>
            <TabsTrigger value="rewards" className="data-[state=active]:bg-sky-500/20">
              <Gift className="w-4 h-4 mr-2" />
              Rewards
            </TabsTrigger>
            <TabsTrigger value="levels" className="data-[state=active]:bg-sky-500/20">
              <Crown className="w-4 h-4 mr-2" />
              Livelli
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Level Progress */}
              <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-sky-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Crown className="w-5 h-5 mr-2 text-yellow-400" />
                    Progresso Livello
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">{currentLevel.title}</span>
                    <span className="text-white/70">Livello {userPoints?.level || 1}</span>
                  </div>
                  <Progress value={progressToNext} className="h-3" />
                  <div className="flex justify-between text-sm text-white/70">
                    <span>{userPoints?.xp || 0} XP</span>
                    <span>{nextLevel ? `${nextLevel.xpRequired} XP` : "MAX"}</span>
                  </div>
                  {nextLevel && (
                    <div className="text-center">
                      <p className="text-white/70 text-sm mb-2">Prossimo livello:</p>
                      <p className="text-sky-400 font-medium">{nextLevel.title}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-sky-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Zap className="w-5 h-5 mr-2 text-cyan-400" />
                    Attività Recente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                        <span className="text-white text-sm">Consulenza completata</span>
                      </div>
                      <span className="text-green-400 font-medium">+50 punti</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                        <span className="text-white text-sm">Badge sbloccato</span>
                      </div>
                      <span className="text-blue-400 font-medium">Prima Esperienza</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-500/10 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                        <span className="text-white text-sm">Reward riscattato</span>
                      </div>
                      <span className="text-purple-400 font-medium">Consulenza Gratuita</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-sky-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Target className="w-5 h-5 mr-2 text-orange-400" />
                  Azioni Rapide per Punti
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                    onClick={() => PointsService.addPoints("current_user", "profile_completed")}
                  >
                    <Star className="w-4 h-4 mr-2" />
                    Completa Profilo (+30)
                  </Button>
                  <Button
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                    onClick={() => PointsService.addPoints("current_user", "daily_login")}
                  >
                    <Flame className="w-4 h-4 mr-2" />
                    Login Giornaliero (+5)
                  </Button>
                  <Button
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    onClick={() => PointsService.addPoints("current_user", "review_written")}
                  >
                    <Award className="w-4 h-4 mr-2" />
                    Scrivi Recensione (+25)
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Badges Tab */}
          <TabsContent value="badges" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {BADGES_CATALOG.map((badge) => {
                const isUnlocked = userBadges.some((ub) => ub.badgeId === badge.id)
                return (
                  <Card
                    key={badge.id}
                    className={`${
                      isUnlocked
                        ? `bg-gradient-to-br from-slate-800/50 to-slate-900/50 border ${rarityColors[badge.rarity].split(" ")[0]}`
                        : "bg-slate-800/30 border-slate-600/30 opacity-60"
                    }`}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="text-4xl mb-3">{badge.icon}</div>
                      <h3 className="text-white font-bold mb-2">{badge.name}</h3>
                      <p className="text-white/70 text-sm mb-3">{badge.description}</p>
                      <Badge variant="outline" className={`${rarityColors[badge.rarity]} text-xs`}>
                        {badge.rarity.toUpperCase()}
                      </Badge>
                      {!isUnlocked && (
                        <div className="mt-3">
                          <Progress value={Math.random() * 100} className="h-2" />
                          <p className="text-xs text-white/50 mt-1">Progresso: {Math.floor(Math.random() * 100)}%</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* Rewards Tab */}
          <TabsContent value="rewards" className="space-y-6">
            <div className="text-center py-12">
              <Gift className="w-16 h-16 mx-auto mb-4 text-white/30" />
              <h3 className="text-white/70 text-lg mb-2">Nessun Reward Disponibile</h3>
              <p className="text-white/50 mb-4">I rewards vengono creati dall'amministratore</p>
              <p className="text-white/40 text-sm">Controlla più tardi per nuovi premi!</p>
            </div>
          </TabsContent>

          {/* Levels Tab */}
          <TabsContent value="levels" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {LEVELS_CONFIG.map((level) => {
                const isUnlocked = (userPoints?.level || 1) >= level.level
                const isCurrent = (userPoints?.level || 1) === level.level

                return (
                  <Card
                    key={level.level}
                    className={`${
                      isCurrent
                        ? "bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30"
                        : isUnlocked
                          ? "bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-sky-500/20"
                          : "bg-slate-800/30 border-slate-600/30 opacity-60"
                    }`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center ${
                              isCurrent ? "bg-yellow-500/20" : isUnlocked ? "bg-sky-500/20" : "bg-slate-600/20"
                            }`}
                          >
                            <span className="text-xl font-bold text-white">{level.level}</span>
                          </div>
                          <div>
                            <h3 className="text-white font-bold">{level.title}</h3>
                            <p className="text-white/70 text-sm">{level.xpRequired} XP richiesti</p>
                          </div>
                        </div>
                        {isCurrent && <Badge className="bg-yellow-500/20 text-yellow-400">ATTUALE</Badge>}
                        {isUnlocked && !isCurrent && (
                          <Badge className="bg-green-500/20 text-green-400">SBLOCCATO</Badge>
                        )}
                      </div>

                      <div>
                        <p className="text-white/70 text-sm mb-2">Benefici:</p>
                        <div className="space-y-1">
                          {level.benefits.map((benefit, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <Diamond className="w-3 h-3 text-sky-400" />
                              <span className="text-white text-sm">{benefit}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
