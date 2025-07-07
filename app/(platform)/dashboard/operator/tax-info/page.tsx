import { getTaxDetails, updateTaxDetails } from "@/lib/actions/operator.actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { SubmitButton } from "@/components/ui/submit-button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default async function TaxInfoPage() {
  const { data: taxDetails, error } = await getTaxDetails()

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
        <h1 className="text-2xl font-bold">Dati Fiscali</h1>
        <p className="text-gray-600">
          Inserisci i tuoi dati fiscali per la corretta emissione delle fatture e dei pagamenti.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Informazioni Fiscali</CardTitle>
          <CardDescription>
            Questi dati sono obbligatori per ricevere i pagamenti e saranno trattati con la massima riservatezza.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateTaxDetails} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company_name">Nome Azienda (se applicabile)</Label>
                <Input id="company_name" name="company_name" defaultValue={taxDetails?.company_name || ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vat_number">Partita IVA</Label>
                <Input id="vat_number" name="vat_number" defaultValue={taxDetails?.vat_number || ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tax_id">Codice Fiscale</Label>
                <Input id="tax_id" name="tax_id" defaultValue={taxDetails?.tax_id || ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Indirizzo</Label>
                <Input id="address" name="address" defaultValue={taxDetails?.address || ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Città</Label>
                <Input id="city" name="city" defaultValue={taxDetails?.city || ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zip_code">CAP</Label>
                <Input id="zip_code" name="zip_code" defaultValue={taxDetails?.zip_code || ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Paese</Label>
                <Input id="country" name="country" defaultValue={taxDetails?.country || ""} />
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <SubmitButton>Salva Dati Fiscali</SubmitButton>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
