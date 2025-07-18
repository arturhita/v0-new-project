import { getAdvancedSettings } from "@/lib/actions/settings.actions"
import { FinancialSettingsForm } from "./financial-settings-form"

export default async function FinancialSettingsPage() {
  const allSettings = await getAdvancedSettings()
  const financialSettings = allSettings.find((s) => s.key === "financials")?.value || {
    platform_commission_percentage: 20,
    call_transfer_fee_client: 0.5,
    call_transfer_fee_operator: 0.25,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Impostazioni Finanziarie</h1>
        <p className="text-muted-foreground">Gestisci le commissioni della piattaforma e le tariffe per i servizi.</p>
      </div>
      <FinancialSettingsForm initialSettings={financialSettings} />
    </div>
  )
}
