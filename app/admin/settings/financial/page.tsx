import { getSettingsByKey } from "@/lib/actions/settings.actions"
import FinancialSettingsForm from "./financial-settings-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function FinancialSettingsPage() {
  const { data: settings, error } = await getSettingsByKey("financials")

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>
  }

  // Parse the JSON value
  const financialData = settings?.value ? JSON.parse(settings.value) : {}

  return (
    <div className="p-4 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Impostazioni Finanziarie</CardTitle>
          <CardDescription>Gestisci le commissioni della piattaforma e altre impostazioni economiche.</CardDescription>
        </CardHeader>
        <CardContent>
          <FinancialSettingsForm currentSettings={financialData} />
        </CardContent>
      </Card>
    </div>
  )
}
