import { getCompanySettings, updateCompanySettings } from "@/lib/actions/admin.actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Save } from "lucide-react"

export default async function CompanyDetailsPage() {
  const settings = await getCompanySettings()

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Dati Aziendali</h1>
      <form action={updateCompanySettings}>
        <Card>
          <CardHeader>
            <CardTitle>Informazioni Azienda</CardTitle>
            <CardDescription>Questi dati verranno usati nelle fatture e nelle comunicazioni ufficiali.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company_name">Nome Azienda</Label>
              <Input id="company_name" name="company_name" defaultValue={settings?.company_name || ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vat_number">Partita IVA / Codice Fiscale</Label>
              <Input id="vat_number" name="vat_number" defaultValue={settings?.vat_number || ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Indirizzo</Label>
              <Input id="address" name="address" defaultValue={settings?.address || ""} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email di Contatto</Label>
                <Input id="email" name="email" type="email" defaultValue={settings?.email || ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefono</Label>
                <Input id="phone" name="phone" type="tel" defaultValue={settings?.phone || ""} />
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-end mt-6">
          <Button type="submit">
            <Save className="mr-2 h-4 w-4" />
            Salva Dati Aziendali
          </Button>
        </div>
      </form>
    </div>
  )
}
