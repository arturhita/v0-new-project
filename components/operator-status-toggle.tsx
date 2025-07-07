"use client"

import { useState, useTransition } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabase/client"

export function OperatorStatusToggle({ operatorId }: { operatorId: string }) {
  const supabase = createClient()
  const { toast } = useToast()
  const [isAvailable, setIsAvailable] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Fetch initial state
  useState(() => {
    const fetchStatus = async () => {
      const { data } = await supabase.from("profiles").select("is_available").eq("id", operatorId).single()
      if (data) {
        setIsAvailable(data.is_available || false)
      }
    }
    fetchStatus()
  })

  const handleToggle = (checked: boolean) => {
    startTransition(async () => {
      setIsAvailable(checked)
      const { error } = await supabase.from("profiles").update({ is_available: checked }).eq("id", operatorId)
      if (error) {
        toast({
          title: "Errore",
          description: "Impossibile aggiornare lo stato.",
          variant: "destructive",
        })
        setIsAvailable(!checked) // Revert on error
      } else {
        toast({
          title: "Stato Aggiornato",
          description: `Ora sei ${checked ? "disponibile" : "non disponibile"}.`,
        })
      }
    })
  }

  return (
    <div className="flex items-center space-x-2 rounded-lg border p-3">
      <Switch id="availability-toggle" checked={isAvailable} onCheckedChange={handleToggle} disabled={isPending} />
      <Label htmlFor="availability-toggle" className="flex flex-col">
        <span className="font-medium">{isAvailable ? "Disponibile" : "Non Disponibile"}</span>
        <span className="text-xs text-gray-500">Attiva per ricevere richieste</span>
      </Label>
    </div>
  )
}
