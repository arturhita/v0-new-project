import { getSettings, saveSettings } from "@/lib/actions/admin.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"

export default async function CompanyDetailsPage() {
  const settings = await getSettings("companyDetails")

  async function handleSave(formData: FormData) {
    "use server"
    const newSettings = {
      companyName: formData.get("companyName"),
      vatNumber: formData.get("vatNumber"),
      address: formData.get("address"),
      email: formData.get("email"),
      phone: formData.get("phone"),
    }
    await saveSettings("companyDetails", newSettings)
  }

  return (
    <div className="p-6">
      <form action={handleSave}>
        <Card>
          <CardHeader>
            <CardTitle>Dati Aziendali</CardTitle>
            <CardDescription>Inserisci i dati legali e di contatto della tua azienda.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="companyName">Nome Azienda</Label>
              <Input id="companyName" name="companyName" defaultValue={settings.companyName || ""} />
            </div>
            <div>
              <Label htmlFor="vatNumber">Partita IVA / Codice Fiscale</Label>
              <Input id="vatNumber" name="vatNumber" defaultValue={settings.vatNumber || ""} />
            </div>
            <div>
              <Label htmlFor="address">Indirizzo</Label>
              <Input id="address" name="address" defaultValue={settings.address || ""} />
            </div>
            <div>
              <Label htmlFor="email">Email di Contatto</Label>
              <Input id="email" name="email" type="email" defaultValue={settings.email || ""} />
            </div>
            <div>
              <Label htmlFor="phone">Telefono</Label>
              <Input id="phone" name="phone" type="tel" defaultValue={settings.phone || ""} />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit">Salva Dati Aziendali</Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
