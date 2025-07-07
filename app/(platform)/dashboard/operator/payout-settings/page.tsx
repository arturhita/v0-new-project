import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { updatePayoutSettings } from "@/lib/actions/payouts.actions"
import { SubmitButton } from "@/components/submit-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { unstable_noStore as noStore } from "next/cache"

export default async function PayoutSettingsPage() {
  noStore()
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect("/login")
  }

  const { data: settings } = await supabase.from("operator_payout_settings").select("*").eq("id", user.id).single()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Impostazioni di Pagamento</CardTitle>
          <CardDescription>
            Scegli come ricevere i tuoi guadagni. I pagamenti vengono elaborati mensilmente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updatePayoutSettings} className="space-y-8">
            <div>
              <Label>Metodo di Pagamento</Label>
              <RadioGroup name="payout_method" defaultValue={settings?.payout_method || "paypal"} className="mt-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="paypal" id="paypal" />
                  <Label htmlFor="paypal">PayPal</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                  <Label htmlFor="bank_transfer">Bonifico Bancario</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Dettagli PayPal</h3>
              <div>
                <Label htmlFor="paypal_email">Email PayPal</Label>
                <Input
                  id="paypal_email"
                  name="paypal_email"
                  type="email"
                  defaultValue={settings?.paypal_email || ""}
                  placeholder="tua.email@example.com"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Dettagli Bonifico Bancario</h3>
              <div>
                <Label htmlFor="bank_account_holder">Intestatario Conto</Label>
                <Input
                  id="bank_account_holder"
                  name="bank_account_holder"
                  defaultValue={settings?.bank_account_holder || ""}
                  placeholder="Mario Rossi"
                />
              </div>
              <div>
                <Label htmlFor="iban">IBAN</Label>
                <Input
                  id="iban"
                  name="iban"
                  defaultValue={settings?.iban || ""}
                  placeholder="IT60X0542811101000000123456"
                />
              </div>
              <div>
                <Label htmlFor="swift_bic">SWIFT/BIC</Label>
                <Input
                  id="swift_bic"
                  name="swift_bic"
                  defaultValue={settings?.swift_bic || ""}
                  placeholder="UNCRITMM"
                />
              </div>
            </div>

            <SubmitButton>Salva Impostazioni</SubmitButton>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
