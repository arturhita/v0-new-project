"use client"

import { useState, useEffect } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { updateOperatorStatus, getOperatorById } from "@/lib/actions/operator.actions"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"

export default function OperatorStatusToggle({ operatorId }: { operatorId: string }) {
  const [isOnline, setIsOnline] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchStatus() {
      if (!operatorId) {
        setIsLoading(false)
        return
      }
      setIsLoading(true)
      const operator = await getOperatorById(operatorId)
      if (operator) {
        setIsOnline(operator.isOnline)
      }
      setIsLoading(false)
    }
    fetchStatus()
  }, [operatorId])

  const handleToggle = async (checked: boolean) => {
    setIsOnline(checked)
    const result = await updateOperatorStatus(operatorId, checked)
    if (result.success) {
      toast.success(`Stato aggiornato a: ${checked ? "Online" : "Offline"}`)
    } else {
      toast.error(result.message || "Errore nell'aggiornamento dello stato.")
      // Revert UI on error
      setIsOnline(!checked)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <Skeleton className="h-6 w-10 rounded-full" />
        <Skeleton className="h-4 w-16" />
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-2">
      <Switch id="online-status" checked={isOnline} onCheckedChange={handleToggle} aria-label="Stato online" />
      <Label htmlFor="online-status" className="cursor-pointer">
        {isOnline ? "Online" : "Offline"}
      </Label>
    </div>
  )
}
