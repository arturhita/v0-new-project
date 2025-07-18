"use client"

import type React from "react"

import { useFormState, useFormStatus } from "react-dom"
import { updateAdvancedSetting } from "@/lib/actions/settings.actions"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { Percent, Euro } from "lucide-react"

const initialState = {
  success: false,
  error: null,
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} size="sm">
      {pending ? "Salvataggio..." : "Salva"}
    </Button>
  )
}

const settingLabels: Record<string, { label: string; description: string; icon: React.ElementType }> = {
  platform_commission_percentage: {
    label: "Commissione Piattaforma (%)",
    description: "Percentuale trattenuta su ogni consulto.",
    icon: Percent,
  },
  call_transfer_fee_client: {
    label: "Costo Trasferimento (Cliente)",
    description: "Costo fisso addebitato al cliente.",
    icon: Euro,
  },
  call_transfer_fee_operator: {
    label: "Costo Trasferimento (Operatore)",
    description: "Costo fisso addebitato all'operatore.",
    icon: Euro,
  },
}

export function FinancialSettingsForm({
  currentSettings,
  settingKey,
}: {
  currentSettings: any
  settingKey: string
}) {
  const updateSettingAction = updateAdvancedSetting.bind(null, "financials")
  const [state, dispatch] = useFormState(updateSettingAction, initialState)
  const { toast } = useToast()

  useEffect(() => {
    if (state.success) {
      toast({
        title: "Impostazioni salvate!",
        description: "Le modifiche sono state applicate.",
      })
    } else if (state.error) {
      toast({
        title: "Errore",
        description: "Non è stato possibile salvare le impostazioni.",
        variant: "destructive",
      })
    }
  }, [state, toast])

  const settingInfo = settingLabels[settingKey]

  return (
    <form action={dispatch} className="p-4 border rounded-lg bg-slate-50">
      <div className="flex justify-between items-start">
        <div>
          <Label htmlFor={settingKey} className="text-base font-semibold">
            {settingInfo.label}
          </Label>
          <p className="text-sm text-slate-500">{settingInfo.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Input
              id={settingKey}
              name={settingKey}
              type="number"
              step={settingKey === "platform_commission_percentage" ? "1" : "0.01"}
              defaultValue={currentSettings[settingKey]}
              className="w-32 pr-8"
            />
            <settingInfo.icon className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
          {/* Hidden inputs to pass other values without changing them */}
          {Object.keys(currentSettings)
            .filter((key) => key !== settingKey)
            .map((key) => (
              <input key={key} type="hidden" name={key} value={currentSettings[key]} />
            ))}
          <SubmitButton />
        </div>
      </div>
      {state.error && <p className="text-red-500 text-sm mt-2">{state.error}</p>}
    </form>
  )
}
