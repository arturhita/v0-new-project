"use client"

import { useState, useTransition } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { updateOperatorStatus } from "@/lib/actions/operator.actions"
import { Loader2 } from "lucide-react"

interface OperatorStatusToggleProps {
  operatorId: string
  initialIsAvailable: boolean
}

export function OperatorStatusToggle({ operatorId, initialIsAvailable }: OperatorStatusToggleProps) {
  const [isAvailable, setIsAvailable] = useState(initialIsAvailable)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const handleToggle = (checked: boolean) => {
    startTransition(async () => {
      const result = await updateOperatorStatus(operatorId, checked)
      if (result.success) {
        setIsAvailable(checked)
        toast({
          title: "Stato aggiornato",
          description: `Ora sei ${checked ? "disponibile" : "non disponibile"} per le consulenze.`,
        })
      } else {
        toast({
          title: "Errore",
          description: result.message,
          variant: "destructive",
        })
      }
    })
  }

  return (
    <div className="flex items-center space-x-3 rounded-lg border border-gray-700 bg-gray-800/50 p-3">
      {isPending ? (
        <Loader2 className="h-5 w-5 animate-spin text-white" />
      ) : (
        <Switch
          id="availability-toggle"
          checked={isAvailable}
          onCheckedChange={handleToggle}
          disabled={isPending}
          aria-label="Disponibilità per consulenze"
        />
      )}
      <Label
        htmlFor="availability-toggle"
        className={`font-medium ${isAvailable ? "text-green-400" : "text-gray-400"}`}
      >
        {isAvailable ? "Disponibile" : "Non Disponibile"}
      </Label>
    </div>
  )
}
