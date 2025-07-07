"use client"

import { useOperatorStatus } from "@/contexts/operator-status-context"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

export function OperatorStatusToggle() {
  const { isOnline, toggleStatus, operatorName } = useOperatorStatus()
  const { toast } = useToast()

  const handleToggle = () => {
    const newStatus = !isOnline
    toggleStatus()
    toast({
      title: `Stato aggiornato per ${operatorName}`,
      description: `Ora sei ${newStatus ? "Online" : "Offline"}.`,
    })
  }

  return (
    <div className="flex items-center space-x-3 p-2 rounded-full bg-gray-100 w-fit">
      <Switch
        id="status-toggle"
        checked={isOnline}
        onCheckedChange={handleToggle}
        className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-300"
      />
      <Label
        htmlFor="status-toggle"
        className={cn("font-semibold transition-colors cursor-pointer", isOnline ? "text-green-600" : "text-gray-500")}
      >
        {isOnline ? "Online" : "Offline"}
      </Label>
    </div>
  )
}
