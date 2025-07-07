"use client"

import { useState, useTransition } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"
import { updateOperatorStatus } from "@/lib/actions/operator.actions"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export function OperatorStatusToggle({ operatorId }: { operatorId: string }) {
  const { profile } = useAuth()
  const [isPending, startTransition] = useTransition()
  const [isAvailable, setIsAvailable] = useState(profile?.is_available ?? false)

  const handleToggle = (checked: boolean) => {
    setIsAvailable(checked)
    startTransition(async () => {
      const result = await updateOperatorStatus(operatorId, checked)
      if (result.success) {
        toast.success(`Stato aggiornato: ora sei ${checked ? "Disponibile" : "Non Disponibile"}.`)
      } else {
        toast.error(result.message || "Impossibile aggiornare lo stato.")
        // Revert UI on failure
        setIsAvailable(!checked)
      }
    })
  }

  return (
    <div className="flex items-center space-x-3 rounded-lg border p-3 dark:border-gray-700">
      <Switch
        id="availability-toggle"
        checked={isAvailable}
        onCheckedChange={handleToggle}
        disabled={isPending}
        aria-label="Toggle availability"
      />
      <Label htmlFor="availability-toggle" className="flex-grow font-medium">
        {isAvailable ? "Disponibile" : "Non Disponibile"}
      </Label>
      {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
    </div>
  )
}
