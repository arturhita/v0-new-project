"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Trophy, Star, Sparkles, ChevronRight, Zap, Target, Award } from "lucide-react"
import Link from "next/link"
import { PointsService, LEVELS_CONFIG } from "@/lib/gamification/points-system"
import { OperatorBadgesService } from "@/lib/gamification/operator-badges"

interface GamificationWidgetProps {
  userId: string
  userType?: "client" | "operator"
  compact?: boolean
}

export default function GamificationWidget({ userId, userType = "client", compact = false }: GamificationWidgetProps) {
  const [userPoints, setUserPoints] = useState<any>(null)
  const [operatorBadges, setOperatorBadges] = useState<any>(null)
  const [recentBadge, setRecentBadge] = useState<any>(null)

  useEffect(() => {
    loadUserData()
  }, [userId, userType])

  const loadUserData = async () => {
    if (userType === "client") {
      const points = await PointsService.getUserPoints(userId)
      setUserPoints(points)
    } else {
      // Per operatori, mostra badge invece di livelli
      const totalConsults = Math.floor(Math.random() * 200) + 5 // Mock data
      const unlockedBadges = OperatorBadgesService.getUnlockedBadges(totalConsults)
      const progress = OperatorBadgesService.getBadgeProgress(totalConsults)

      setOperatorBadges({
        totalConsults,
        unlockedBadges,
        progress,
        points: totalConsults * 100, // 100 punti per consulto
      })
    }
  }

  if (compact) {
    return (
      <Card className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
                {userType === "client" ? (
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                ) : (
                  <Award className="w-5 h-5 text-purple-400" />
                )}
              </div>
              <div>
                {userType === "client" ? (
                  <>
                    <p className="text-white font-medium">{userPoints?.availablePoints || 0} Punti</p>
                    <p className="text-white/70 text-sm">Livello {userPoints?.level || 1}</p>
                  </>
                ) : (
                  <>
                    <p className="text-white font-medium">{operatorBadges?.unlockedBadges?.length || 0} Badge</p>
                    <p className="text-white/70 text-sm">{operatorBadges?.totalConsults || 0} consulti</p>
                  </>
                )}
              </div>
            </div>
            <Link href="/gamification">
              <Button size="sm" variant="ghost" className="text-yellow-400 hover:text-yellow-300">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (userType === "operator") {
    return (
      <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-purple-500/20">
        <CardContent className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white flex items-center">
              <Award className="w-5 h-5 mr-2 text-purple-400" />I Tuoi Badge
            </h3>
            <Link href="/gamification">
              <Button size="sm" className="bg-gradient-to-r from-purple-500 to-pink-500">
                Vedi Tutto
              </Button>
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-purple-500/10 rounded-lg">
              <Target className="w-6 h-6 mx-auto mb-1 text-purple-400" />
              <div className="text-lg font-bold text-white">{operatorBadges?.totalConsults || 0}</div>
              <div className="text-xs text-white/70">Consulti</div>
            </div>
            <div className="text-center p-3 bg-yellow-500/10 rounded-lg">
              <Award className="w-6 h-6 mx-auto mb-1 text-yellow-400" />
              <div className="text-lg font-bold text-white">{operatorBadges?.unlockedBadges?.length || 0}</div>
              <div className="text-xs text-white/70">Badge</div>
            </div>
            <div className="text-center p-3 bg-green-500/10 rounded-lg">
              <Sparkles className="w-6 h-6 mx-auto mb-1 text-green-400" />
              <div className="text-lg font-bold text-white">{operatorBadges?.points || 0}</div>
              <div className="text-xs text-white/70">Punti</div>
            </div>
          </div>

          {/* Badge Progress */}
          {operatorBadges?.progress?.nextBadge && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white font-medium flex items-center">
                  <span className="text-2xl mr-2">{operatorBadges.progress.nextBadge.icon}</span>
                  Prossimo Badge
                </span>
                <span className="text-white/70 text-sm">{operatorBadges.progress.nextBadge.name}</span>
              </div>

              <Progress value={operatorBadges.progress.percentage} className="h-2" />
              <div className="flex justify-between text-xs text-white/70">
                <span>{operatorBadges.progress.current} consulti</span>
                <span>{operatorBadges.progress.required} consulti</span>
              </div>
            </div>
          )}

          {/* Recent Badges */}
          {operatorBadges?.unlockedBadges?.length > 0 && (
            <div className="space-y-2">
              <p className="text-white/70 text-sm">Badge ottenuti:</p>
              <div className="flex flex-wrap gap-2">
                {operatorBadges.unlockedBadges.slice(-3).map((badge: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-sm"
                    title={badge.description}
                  >
                    <span>{badge.icon}</span>
                    <span>{badge.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // Client widget (existing code)
  const currentLevel = LEVELS_CONFIG.find((l) => l.level === userPoints?.level) || LEVELS_CONFIG[0]
  const nextLevel = LEVELS_CONFIG.find((l) => l.level === (userPoints?.level || 1) + 1)
  const progressToNext = nextLevel ? ((userPoints?.xp || 0) / nextLevel.xpRequired) * 100 : 100

  return (
    <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-sky-500/20">
      <CardContent className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white flex items-center">
            <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
            Il Tuo Progresso
          </h3>
          <Link href="/gamification">
            <Button size="sm" className="bg-gradient-to-r from-sky-500 to-cyan-500">
              Vedi Tutto
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-yellow-500/10 rounded-lg">
            <Sparkles className="w-6 h-6 mx-auto mb-1 text-yellow-400" />
            <div className="text-lg font-bold text-white">{userPoints?.availablePoints || 0}</div>
            <div className="text-xs text-white/70">Punti</div>
          </div>
          <div className="text-center p-3 bg-purple-500/10 rounded-lg">
            <Trophy className="w-6 h-6 mx-auto mb-1 text-purple-400" />
            <div className="text-lg font-bold text-white">{userPoints?.level || 1}</div>
            <div className="text-xs text-white/70">Livello</div>
          </div>
          <div className="text-center p-3 bg-blue-500/10 rounded-lg">
            <Star className="w-6 h-6 mx-auto mb-1 text-blue-400" />
            <div className="text-lg font-bold text-white">12</div>
            <div className="text-xs text-white/70">Badge</div>
          </div>
        </div>

        {/* Level Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-white font-medium">{currentLevel.title}</span>
            <span className="text-white/70 text-sm">
              {userPoints?.xp || 0} / {nextLevel?.xpRequired || 0} XP
            </span>
          </div>
          <Progress value={progressToNext} className="h-2" />
          {nextLevel && (
            <p className="text-center text-white/70 text-sm">
              Prossimo: <span className="text-sky-400">{nextLevel.title}</span>
            </p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="space-y-2">
          <p className="text-white/70 text-sm">Guadagna punti velocemente:</p>
          <div className="grid grid-cols-2 gap-2">
            <Button
              size="sm"
              variant="outline"
              className="text-xs border-green-500/30 text-green-400 hover:bg-green-500/10"
              onClick={() => PointsService.addPoints(userId, "daily_login")}
            >
              <Zap className="w-3 h-3 mr-1" />
              Login (+5)
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-xs border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
              onClick={() => PointsService.addPoints(userId, "review_written")}
            >
              <Star className="w-3 h-3 mr-1" />
              Recensione (+25)
            </Button>
          </div>
        </div>

        {/* Recent Achievement */}
        {recentBadge && (
          <div className="p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
            <div className="flex items-center gap-3">
              <div className="text-2xl">{recentBadge.icon}</div>
              <div>
                <p className="text-white font-medium text-sm">Badge Sbloccato!</p>
                <p className="text-purple-400 text-xs">{recentBadge.name}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
