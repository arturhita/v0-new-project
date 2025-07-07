import { getPayoutSettings } from "@/lib/actions/payouts.actions"
import { updatePayoutSettings } from "@/lib/actions/payouts.actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SubmitButton } from "@/components/ui/submit-button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default async function PayoutSettingsPage() {
  const { data: settings, error } = await getPayoutSettings()

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Errore</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Impostazioni di Pagamento</h1>
        <p className="text-gray-600">Configura il metodo con cui desideri ricevere i tuoi guadagni.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Metodo di Pagamento</CardTitle>
          <CardDescription>
            Le informazioni fornite saranno utilizzate per inviarti i pagamenti. Assicurati che siano corrette.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updatePayoutSettings} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="payout_method">Metodo Preferito</Label>
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
              <Input
                id="paypal_email"
                name="paypal_email"
                type="email"
                defaultValue={settings?.paypal_email || ""}
                placeholder="iltuo@indirizzo.paypal"
              />
            </div>

            <fieldset className="space-y-4 border-t pt-4">
              <legend className="text-sm font-medium">Dettagli Bonifico Bancario</legend>
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

            <div className="flex justify-end pt-4">
              <SubmitButton>Salva Impostazioni</SubmitButton>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
