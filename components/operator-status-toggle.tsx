"use client"

import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { toggleAvailability } from "@/lib/actions/operator.actions"
import { useToast } from "./ui/use-toast"

export default function OperatorStatusToggle({ initialIsAvailable }: { initialIsAvailable: boolean }) {
  const [isAvailable, setIsAvailable] = useState(initialIsAvailable)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleChange = async (checked: boolean) => {
    setIsLoading(true)
    setIsAvailable(checked)
    const result = await toggleAvailability(checked)
    if (result.success) {
      toast({
        title: "Stato aggiornato",
        description: result.message,
      })
    } else {
      // Revert state on failure
      setIsAvailable(!checked)
      toast({
        title: "Errore",
        description: result.message,
        variant: "destructive",
      })
    }
    setIsLoading(false)
  }

  return (
    <div className="flex items-center space-x-2 rounded-full bg-gray-100 p-2">
      <Label
        htmlFor="availability-switch"
        className={isAvailable ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}
      >
        {isAvailable ? "Disponibile" : "Non Disponibile"}
      </Label>
      <Switch
        id="availability-switch"
        checked={isAvailable}
        onCheckedChange={handleChange}
        disabled={isLoading}
        aria-label="Toggle availability"
      />
    </div>
  )
}
