"use client"

import { Moon, Sun, Coffee, AlertTriangle, ChevronDown } from "lucide-react"
import { useOperatorStatus } from "@/contexts/operator-status-context"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export default function OperatorStatusDropdown() {
  const { status, setStatus, pauseTimer } = useOperatorStatus()

  const handleSetStatusManually = (newStatus: "online" | "offline" | "paused") => {
    setStatus(newStatus, true)
  }

  const getStatusIndicator = () => {
    switch (status) {
      case "online":
        return {
          icon: Sun,
          text: "Online",
          buttonClass: "border-green-300 text-green-700 hover:bg-green-50",
          dotClass: "bg-green-500",
        }
      case "offline":
        return {
          icon: Moon,
          text: "Offline",
          buttonClass: "border-gray-300 text-gray-700 hover:bg-gray-50",
          dotClass: "bg-gray-500",
        }
      case "occupied":
        return {
          icon: AlertTriangle,
          text: "Occupato",
          buttonClass: "border-red-300 text-red-700 hover:bg-red-50 animate-pulse",
          dotClass: "bg-red-500",
        }
      case "paused":
        return {
          icon: Coffee,
          text: `In Pausa (${Math.floor(pauseTimer / 60)}:${(pauseTimer % 60).toString().padStart(2, "0")})`,
          buttonClass: "border-amber-300 text-amber-700 hover:bg-amber-50",
          dotClass: "bg-amber-500",
        }
      default:
        return {
          icon: Moon,
          text: "Offline",
          buttonClass: "border-gray-300 text-gray-700 hover:bg-gray-50",
          dotClass: "bg-gray-500",
        }
    }
  }
  const currentStatusInfo = getStatusIndicator()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "flex items-center gap-2 rounded-full px-3 py-1.5 text-sm border-2 bg-white",
            currentStatusInfo.buttonClass,
          )}
        >
          <span className={cn("h-2.5 w-2.5 rounded-full", currentStatusInfo.dotClass)} />
          <span className="font-medium">{currentStatusInfo.text}</span>
          <ChevronDown className="h-4 w-4 opacity-80" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-white border-gray-200">
        <DropdownMenuLabel className="text-gray-700">Imposta il tuo stato</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-200" />
        <DropdownMenuItem
          onClick={() => handleSetStatusManually("online")}
          disabled={status === "online"}
          className="text-gray-800 focus:bg-blue-100"
        >
          <Sun className="mr-2 h-4 w-4 text-green-500" />
          <span>Online</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleSetStatusManually("paused")}
          disabled={status === "paused"}
          className="text-gray-800 focus:bg-blue-100"
        >
          <Coffee className="mr-2 h-4 w-4 text-amber-500" />
          <span>Pausa (20 min)</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleSetStatusManually("offline")}
          disabled={status === "offline"}
          className="text-gray-800 focus:bg-blue-100"
        >
          <Moon className="mr-2 h-4 w-4 text-gray-500" />
          <span>Offline</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
