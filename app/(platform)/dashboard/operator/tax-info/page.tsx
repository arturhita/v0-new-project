import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getOperatorTaxDetails, saveOperatorTaxDetails } from "@/lib/actions/operator.actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { SubmitButton } from "@/components/submit-button"

export default async function TaxInfoPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const taxDetails = await getOperatorTaxDetails(user.id)
  const boundAction = saveOperatorTaxDetails.bind(null)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dati Fiscali</CardTitle>
        <CardDescription>Inserisci i tuoi dati fiscali per la corretta emissione delle fatture.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={boundAction} className="space-y-6">
          <input type="hidden" name="operator_id" value={user.id} />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="company_name">Nome Azienda (opzionale)</Label>
              <Input id="company_name" name="company_name" defaultValue={taxDetails?.company_name || ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vat_number">Partita IVA</Label>
              <Input id="vat_number" name="vat_number" defaultValue={taxDetails?.vat_number || ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tax_id">Codice Fiscale</Label>
              <Input id="tax_id" name="tax_id" defaultValue={taxDetails?.tax_id || ""} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Indirizzo</Label>
              <Input id="address" name="address" defaultValue={taxDetails?.address || ""} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Città</Label>
              <Input id="city" name="city" defaultValue={taxDetails?.city || ""} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zip_code">CAP</Label>
              <Input id="zip_code" name="zip_code" defaultValue={taxDetails?.zip_code || ""} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Paese</Label>
              <Input id="country" name="country" defaultValue={taxDetails?.country || ""} required />
            </div>
          </div>
          <div className="flex justify-end">
            <SubmitButton>Salva Dati Fiscali</SubmitButton>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
