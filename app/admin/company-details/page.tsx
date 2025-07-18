import { getSettings } from "@/lib/actions/settings.actions"
import { updateSettings } from "@/lib/actions/settings.actions"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default async function CompanyDetailsPage() {
  const settings = await getSettings()

  return (
    <div className="p-6">
      <form action={updateSettings}>
        <Card>
          <CardHeader>
            <CardTitle>Dati Aziendali</CardTitle>
            <CardDescription>Inserisci i dati legali e fiscali della tua azienda.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company_name">Nome Azienda</Label>
              <Input id="company_name" name="company_name" defaultValue={settings.companyDetails?.name} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company_vat">Partita IVA / Codice Fiscale</Label>
              <Input id="company_vat" name="company_vat" defaultValue={settings.companyDetails?.vat} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company_address">Indirizzo Sede Legale</Label>
              <Input id="company_address" name="company_address" defaultValue={settings.companyDetails?.address} />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit">Salva Modifiche</Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
