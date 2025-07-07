import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getPayoutSettings, savePayoutSettings } from "@/lib/actions/payouts.actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SubmitButton } from "@/components/submit-button"

export default async function PayoutSettingsPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const settings = await getPayoutSettings(user.id)
  const boundAction = savePayoutSettings.bind(null, user.id)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Impostazioni di Pagamento</CardTitle>
        <CardDescription>Configura il metodo con cui desideri ricevere i tuoi guadagni.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={boundAction} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="payout_method">Metodo di Pagamento</Label>
            <Select name="payout_method" defaultValue={settings?.payout_method || "paypal"}>
              <SelectTrigger>
                <SelectValue placeholder="Seleziona un metodo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paypal">PayPal</SelectItem>
                <SelectItem value="bank_transfer">Bonifico Bancario</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="paypal_email">Email PayPal</Label>
            <Input id="paypal_email" name="paypal_email" type="email" defaultValue={settings?.paypal_email || ""} />
          </div>

          <fieldset className="space-y-4 rounded-lg border p-4">
            <legend className="-ml-1 px-1 text-sm font-medium">Dettagli Bonifico</legend>
            <div className="space-y-2">
              <Label htmlFor="bank_account_holder">Intestatario Conto</Label>
              <Input
                id="bank_account_holder"
                name="bank_account_holder"
                defaultValue={settings?.bank_account_holder || ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="iban">IBAN</Label>
              <Input id="iban" name="iban" defaultValue={settings?.iban || ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="swift_bic">SWIFT/BIC</Label>
              <Input id="swift_bic" name="swift_bic" defaultValue={settings?.swift_bic || ""} />
            </div>
          </fieldset>

          <div className="flex justify-end">
            <SubmitButton>Salva Impostazioni</SubmitButton>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
