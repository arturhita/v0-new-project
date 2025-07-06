"use client"

import { Progress } from "@/components/ui/progress"
import { Crown, Sparkles } from "lucide-react"
import { LEVELS_CONFIG } from "@/lib/gamification/points-system"

interface LevelProgressBarProps {
  currentLevel: number
  currentXP: number
  compact?: boolean
}

export default function LevelProgressBar({ currentLevel, currentXP, compact = false }: LevelProgressBarProps) {
  const current = LEVELS_CONFIG.find((l) => l.level === currentLevel) || LEVELS_CONFIG[0]
  const next = LEVELS_CONFIG.find((l) => l.level === currentLevel + 1)

  const progress = next ? (currentXP / next.xpRequired) * 100 : 100
  const isMaxLevel = !next

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Crown className="w-4 h-4 text-yellow-400" />
        <div className="flex-1">
          <Progress value={progress} className="h-2" />
        </div>
        <span className="text-xs text-white/70">Lv.{currentLevel}</span>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-yellow-400" />
          <span className="text-white font-medium">{current.title}</span>
          <span className="text-white/70 text-sm">Livello {currentLevel}</span>
        </div>
        {!isMaxLevel && (
          <span className="text-white/70 text-sm">
            {currentXP} / {next.xpRequired} XP
          </span>
        )}
      </div>

      {!isMaxLevel ? (
        <>
          <Progress value={progress} className="h-3" />
          <div className="text-center">
            <p className="text-white/70 text-sm">
              Prossimo: <span className="text-sky-400">{next.title}</span>
            </p>
            <p className="text-white/50 text-xs">{next.xpRequired - currentXP} XP rimanenti</p>
          </div>
        </>
      ) : (
        <div className="text-center p-3 bg-yellow-500/10 rounded-lg">
          <Sparkles className="w-6 h-6 mx-auto mb-1 text-yellow-400" />
          <p className="text-yellow-400 font-medium">Livello Massimo Raggiunto!</p>
        </div>
      )}
    </div>
  )
}
