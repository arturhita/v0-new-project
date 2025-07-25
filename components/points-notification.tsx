"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, Sparkles, Trophy, Star, Gift } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface PointsNotificationProps {
  points: number
  reason: string
  type: "earned" | "spent" | "badge" | "level_up"
  onClose: () => void
  autoClose?: boolean
  duration?: number
}

export default function PointsNotification({
  points,
  reason,
  type,
  onClose,
  autoClose = true,
  duration = 5000,
}: PointsNotificationProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(onClose, 300)
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [autoClose, duration, onClose])

  const getIcon = () => {
    switch (type) {
      case "earned":
        return <Sparkles className="w-6 h-6 text-yellow-400" />
      case "badge":
        return <Trophy className="w-6 h-6 text-purple-400" />
      case "level_up":
        return <Star className="w-6 h-6 text-blue-400" />
      default:
        return <Gift className="w-6 h-6 text-green-400" />
    }
  }

  const getColors = () => {
    switch (type) {
      case "earned":
        return "from-yellow-500/20 to-orange-500/20 border-yellow-500/30"
      case "badge":
        return "from-purple-500/20 to-pink-500/20 border-purple-500/30"
      case "level_up":
        return "from-blue-500/20 to-cyan-500/20 border-blue-500/30"
      default:
        return "from-green-500/20 to-emerald-500/20 border-green-500/30"
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          className="fixed top-4 right-4 z-50"
        >
          <Card className={`bg-gradient-to-r ${getColors()} backdrop-blur-xl shadow-2xl max-w-sm`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">{getIcon()}</div>
                  <div>
                    <p className="text-white font-medium">
                      {type === "earned" && `+${points} Punti!`}
                      {type === "badge" && "Badge Sbloccato!"}
                      {type === "level_up" && "Livello Aumentato!"}
                      {type === "spent" && `${points} Punti Spesi`}
                    </p>
                    <p className="text-white/70 text-sm">{reason}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setIsVisible(false)
                    setTimeout(onClose, 300)
                  }}
                  className="text-white/70 hover:text-white p-1 h-auto"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
