"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Trophy, Lock } from "lucide-react"
import { BadgesService, BADGES_CATALOG } from "@/lib/gamification/badges-system"

interface BadgeShowcaseProps {
  userId: string
  limit?: number
  showProgress?: boolean
}

export default function BadgeShowcase({ userId, limit = 6, showProgress = true }: BadgeShowcaseProps) {
  const [userBadges, setUserBadges] = useState<any[]>([])
  const [availableBadges, setAvailableBadges] = useState<any[]>([])

  useEffect(() => {
    loadBadges()
  }, [userId])

  const loadBadges = async () => {
    const [unlocked, available] = await Promise.all([
      BadgesService.getUserBadges(userId),
      BadgesService.getAvailableBadges(userId),
    ])

    setUserBadges(unlocked)
    setAvailableBadges(available.slice(0, limit - unlocked.length))
  }

  const rarityColors = {
    common: "border-gray-400 bg-gray-50 text-gray-700",
    rare: "border-blue-400 bg-blue-50 text-blue-700",
    epic: "border-purple-400 bg-purple-50 text-purple-700",
    legendary: "border-yellow-400 bg-yellow-50 text-yellow-700",
  }

  const displayBadges = [
    ...userBadges.map((ub) => ({
      ...BADGES_CATALOG.find((b) => b.id === ub.badgeId),
      unlocked: true,
      unlockedAt: ub.unlockedAt,
    })),
    ...availableBadges.map((badge) => ({
      ...badge,
      unlocked: false,
      progress: Math.floor(Math.random() * 80), // Simulazione progresso
    })),
  ].slice(0, limit)

  return (
    <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-sky-500/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Trophy className="w-5 h-5 mr-2 text-yellow-400" />I Tuoi Badge ({userBadges.length}/{BADGES_CATALOG.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {displayBadges.map((badge, index) => (
            <div
              key={badge?.id || index}
              className={`p-4 rounded-lg text-center transition-all duration-300 ${
                badge?.unlocked
                  ? "bg-gradient-to-br from-sky-500/10 to-cyan-500/10 border border-sky-500/20"
                  : "bg-slate-700/30 border border-slate-600/30 opacity-60"
              }`}
            >
              <div className="text-3xl mb-2">
                {badge?.unlocked ? badge.icon : <Lock className="w-8 h-8 mx-auto text-slate-400" />}
              </div>
              <h4 className="text-white font-medium text-sm mb-1">{badge?.name || "Badge Bloccato"}</h4>
              <p className="text-white/70 text-xs mb-2 line-clamp-2">
                {badge?.description || "Completa le sfide per sbloccare"}
              </p>

              {badge && (
                <Badge variant="outline" className={`text-xs ${rarityColors[badge.rarity]} mb-2`}>
                  {badge.rarity.toUpperCase()}
                </Badge>
              )}

              {!badge?.unlocked && showProgress && badge?.progress !== undefined && (
                <div className="mt-2">
                  <Progress value={badge.progress} className="h-1" />
                  <p className="text-xs text-white/50 mt-1">{badge.progress}%</p>
                </div>
              )}

              {badge?.unlocked && badge.unlockedAt && (
                <p className="text-xs text-green-400 mt-1">{new Date(badge.unlockedAt).toLocaleDateString()}</p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
