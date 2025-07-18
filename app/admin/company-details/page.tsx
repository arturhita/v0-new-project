// Dettagli Azienda (company-details/page.tsx) - UI Placeholder
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input" // Assicurati che Input sia importato

export default function CompanyDetailsPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-3xl font-bold tracking-tight text-slate-800">Dettagli Azienda</h1>
      <p className="text-slate-600">Modifica informazioni legali e fiscali della piattaforma.</p>
      <div className="p-6 bg-white rounded-lg shadow-xl space-y-5">
        <div>
          <Label htmlFor="companyName" className="text-md font-medium text-slate-700">
            Nome Azienda
          </Label>
          <Input id="companyName" type="text" defaultValue="ConsulenzaEvo S.R.L." className="mt-1" />
        </div>
        <div>
          <Label htmlFor="vatNumber" className="text-md font-medium text-slate-700">
            Partita IVA
          </Label>
          <Input id="vatNumber" type="text" defaultValue="IT12345678901" className="mt-1" />
        </div>
        <div>
          <Label htmlFor="address" className="text-md font-medium text-slate-700">
            Indirizzo Sede Legale
          </Label>
          <Input id="address" type="text" defaultValue="Via Roma 1, 00100 Roma (RM)" className="mt-1" />
        </div>
        <Button className="w-full bg-gradient-to-r from-[hsl(var(--primary-light))] to-[hsl(var(--primary-medium))] text-white shadow-md hover:opacity-90 py-3 text-base">
          Salva Modifiche
        </Button>
      </div>
    </div>
  )
}
