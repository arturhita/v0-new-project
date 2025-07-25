"use client"

import { Badge } from "@/components/ui/badge"
import { OPERATOR_LEVELS } from "@/lib/gamification/operator-levels"

interface OperatorLevelBadgeProps {
  level: number
  showTitle?: boolean
  size?: "sm" | "md" | "lg"
  className?: string
}

export function OperatorLevelBadge({ level, showTitle = true, size = "md", className = "" }: OperatorLevelBadgeProps) {
  const levelInfo = OPERATOR_LEVELS.find((l) => l.level === level) || OPERATOR_LEVELS[0]

  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-2",
  }

  const iconSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  }

  return (
    <Badge
      className={`
        ${levelInfo.badgeColor} 
        bg-gradient-to-r from-slate-700/50 to-slate-800/50 
        border border-current/30 
        ${sizeClasses[size]}
        ${className}
      `}
    >
      <span className={`mr-1 ${iconSizes[size]}`}>{levelInfo.badgeIcon}</span>
      {showTitle && levelInfo.title}
    </Badge>
  )
}

// Badge per profilo pubblico operatore
export function PublicOperatorBadge({ level, totalConsults }: { level: number; totalConsults: number }) {
  const levelInfo = OPERATOR_LEVELS.find((l) => l.level === level) || OPERATOR_LEVELS[0]

  return (
    <div className="flex items-center gap-2 bg-gradient-to-r from-slate-800/50 to-slate-900/50 rounded-lg px-3 py-2 border border-slate-600/30">
      <span className={`text-2xl ${levelInfo.badgeColor}`}>{levelInfo.badgeIcon}</span>
      <div>
        <p className={`font-bold ${levelInfo.badgeColor}`}>{levelInfo.title}</p>
        <p className="text-white/70 text-xs">{totalConsults} consulti completati</p>
      </div>
    </div>
  )
}
