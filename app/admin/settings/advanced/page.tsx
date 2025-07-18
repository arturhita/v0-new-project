import { getAdvancedSettings } from "@/lib/actions/settings.actions"
import { AdvancedSettingsClient } from "./advanced-settings-client"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default async function AdvancedSettingsPage() {
  const settings = await getAdvancedSettings()

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Impostazioni Avanzate</CardTitle>
          <CardDescription>
            Modifica i parametri di basso livello della piattaforma. Procedere con cautela.
          </CardDescription>
        </CardHeader>
      </Card>
      <AdvancedSettingsClient initialSettings={settings} />
    </div>
  )
}
