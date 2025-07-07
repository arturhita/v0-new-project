import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { updateTaxDetails } from "@/lib/actions/payouts.actions"
import { SubmitButton } from "@/components/submit-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { unstable_noStore as noStore } from "next/cache"

export default async function TaxInfoPage() {
  noStore()
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect("/login")
  }

  const { data: taxDetails } = await supabase.from("operator_tax_details").select("*").eq("id", user.id).single()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Dati Fiscali e di Fatturazione</CardTitle>
          <CardDescription>
            Mantieni aggiornati i tuoi dati fiscali per garantire che le fatture e i pagamenti siano corretti.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateTaxDetails} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="company_name">Nome Azienda (Opzionale)</Label>
                <Input id="company_name" name="company_name" defaultValue={taxDetails?.company_name || ""} />
              </div>
              <div>
                <Label htmlFor="vat_number">Partita IVA</Label>
                <Input id="vat_number" name="vat_number" defaultValue={taxDetails?.vat_number || ""} required />
              </div>
              <div>
                <Label htmlFor="tax_id">Codice Fiscale (Opzionale)</Label>
                <Input id="tax_id" name="tax_id" defaultValue={taxDetails?.tax_id || ""} />
              </div>
              <div>
                <Label htmlFor="address">Indirizzo</Label>
                <Input id="address" name="address" defaultValue={taxDetails?.address || ""} required />
              </div>
              <div>
                <Label htmlFor="city">Città</Label>
                <Input id="city" name="city" defaultValue={taxDetails?.city || ""} required />
              </div>
              <div>
                <Label htmlFor="zip_code">CAP</Label>
                <Input id="zip_code" name="zip_code" defaultValue={taxDetails?.zip_code || ""} required />
              </div>
              <div>
                <Label htmlFor="country">Nazione</Label>
                <Input id="country" name="country" defaultValue={taxDetails?.country || ""} required />
              </div>
            </div>
            <SubmitButton>Salva Dati Fiscali</SubmitButton>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
