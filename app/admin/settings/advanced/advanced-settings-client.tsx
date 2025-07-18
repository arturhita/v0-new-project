"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { updateAdvancedSetting } from "@/lib/actions/settings.actions"
import { useToast } from "@/components/ui/use-toast"

type Setting = {
  key: string
  value: any
  description: string | null
}

export function AdvancedSettingsClient({ initialSettings }: { initialSettings: Setting[] }) {
  const [settings, setSettings] = useState(initialSettings)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSettingChange = (key: string, field: string, value: any) => {
    setSettings((prevSettings) =>
      prevSettings.map((s) => (s.key === key ? { ...s, value: { ...s.value, [field]: value } } : s)),
    )
  }

  const handleSave = async (key: string) => {
    setIsLoading(true)
    const settingToSave = settings.find((s) => s.key === key)
    if (settingToSave) {
      const result = await updateAdvancedSetting(key, settingToSave.value)
      if (result.success) {
        toast({
          title: "Successo",
          description: `Impostazione "${key}" aggiornata.`,
        })
      } else {
        toast({
          title: "Errore",
          description: result.error,
          variant: "destructive",
        })
      }
    }
    setIsLoading(false)
  }

  const maintenanceSetting = settings.find((s) => s.key === "maintenance_mode")
  const commissionSetting = settings.find((s) => s.key === "new_operator_commission")

  return (
    <div className="space-y-6">
      {maintenanceSetting && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <Label htmlFor="maintenance-switch" className="text-lg font-semibold">
                Modalità Manutenzione
              </Label>
              <p className="text-sm text-muted-foreground">{maintenanceSetting.description}</p>
              <div className="flex items-center space-x-2 pt-2">
                <Switch
                  id="maintenance-switch"
                  checked={maintenanceSetting.value.enabled}
                  onCheckedChange={(checked) => handleSettingChange("maintenance_mode", "enabled", checked)}
                />
                <Label htmlFor="maintenance-switch">{maintenanceSetting.value.enabled ? "Attiva" : "Disattiva"}</Label>
              </div>
              {maintenanceSetting.value.enabled && (
                <div className="pt-4 space-y-2">
                  <Label htmlFor="maintenance-message">Messaggio di Manutenzione</Label>
                  <Textarea
                    id="maintenance-message"
                    value={maintenanceSetting.value.message}
                    onChange={(e) => handleSettingChange("maintenance_mode", "message", e.target.value)}
                  />
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button onClick={() => handleSave("maintenance_mode")} disabled={isLoading}>
              {isLoading ? "Salvataggio..." : "Salva Impostazioni Manutenzione"}
            </Button>
          </CardFooter>
        </Card>
      )}

      {commissionSetting && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <Label htmlFor="commission-rate" className="text-lg font-semibold">
                Commissione Nuovi Operatori
              </Label>
              <p className="text-sm text-muted-foreground">{commissionSetting.description}</p>
              <div className="pt-2">
                <Label htmlFor="commission-rate">Tasso di commissione (es. 0.3 per 30%)</Label>
                <Input
                  id="commission-rate"
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={commissionSetting.value.rate}
                  onChange={(e) =>
                    handleSettingChange("new_operator_commission", "rate", Number.parseFloat(e.target.value))
                  }
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button onClick={() => handleSave("new_operator_commission")} disabled={isLoading}>
              {isLoading ? "Salvataggio..." : "Salva Impostazione Commissione"}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
