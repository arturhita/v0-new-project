import { getAdvancedSetting } from "@/lib/actions/settings.actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GeneralSettingsForm } from "./general-settings-form"

export default async function GeneralSettingsPage() {
  const settingsData = await getAdvancedSetting("general_settings")
  const settings = (settingsData?.value as { site_name?: string; contact_email?: string }) ?? {}

  return (
    <div className="p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Impostazioni Generali</CardTitle>
          <CardDescription>Modifica le informazioni di base del tuo sito web.</CardDescription>
        </CardHeader>
        <CardContent>
          <GeneralSettingsForm currentSettings={settings} />
        </CardContent>
      </Card>
    </div>
  )
}
