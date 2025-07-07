"use client"

import { useOperatorStatus } from "@/contexts/operator-status-context"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Wifi, WifiOff, Pause, Play } from "lucide-react"

export default function OperatorStatusToggle() {
  const { status, setStatus, pauseTimer } = useOperatorStatus()

  const handleToggleOnline = () => {
    if (status === "online" || status === "paused") {
      setStatus("offline", true)
    } else {
      setStatus("online", true)
    }
  }

  const handleTogglePause = () => {
    if (status === "paused") {
      setStatus("online", true) // Riprende dalla pausa
    } else {
      setStatus("paused", true)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={handleToggleOnline}
        variant={status === "online" ? "default" : "outline"}
        className={cn(
          "w-28 transition-all",
          status === "online" && "bg-green-500 hover:bg-green-600 text-white",
          status === "offline" && "text-red-500 border-red-300 hover:bg-red-50 hover:text-red-600",
          status === "paused" && "bg-yellow-500 hover:bg-yellow-600 text-white",
          status === "occupied" && "bg-gray-400 text-white",
        )}
        disabled={status === "occupied"}
      >
        {status === "online" ? <Wifi className="mr-2 h-4 w-4" /> : <WifiOff className="mr-2 h-4 w-4" />}
        {status === "online" ? "Online" : "Offline"}
      </Button>
      <Button
        onClick={handleTogglePause}
        variant="outline"
        className="w-36 bg-transparent"
        disabled={status === "offline" || status === "occupied"}
      >
        {status === "paused" ? (
          <>
            <Play className="mr-2 h-4 w-4" />
            <span>Riprendi ({formatTime(pauseTimer)})</span>
          </>
        ) : (
          <>
            <Pause className="mr-2 h-4 w-4" />
            <span>Pausa</span>
          </>
        )}
      </Button>
    </div>
  )
}
