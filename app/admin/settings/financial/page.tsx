import { getAdvancedSettings } from "@/lib/actions/settings.actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FinancialSettingsForm } from "./financial-settings-form"
import { DollarSign, PhoneForwarded } from "lucide-react"

export default async function FinancialSettingsPage() {
  const allSettings = await getAdvancedSettings()
  const financialData = allSettings.find((s) => s.key === "financials")?.value || {
    platform_commission_percentage: 20,
    call_transfer_fee_client: 0.5,
    call_transfer_fee_operator: 0.25,
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-sky-600" />
            Commissioni Piattaforma
          </CardTitle>
          <CardDescription>
            Imposta la percentuale di commissione trattenuta dalla piattaforma su ogni transazione.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FinancialSettingsForm currentSettings={financialData} settingKey="platform_commission_percentage" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PhoneForwarded className="h-5 w-5 text-sky-600" />
            Tariffe Trasferimento di Chiamata
          </CardTitle>
          <CardDescription>
            Imposta i costi fissi addebitati per il servizio di trasferimento di chiamata.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FinancialSettingsForm currentSettings={financialData} settingKey="call_transfer_fee_client" />
          <FinancialSettingsForm currentSettings={financialData} settingKey="call_transfer_fee_operator" />
        </CardContent>
      </Card>
    </div>
  )
}
