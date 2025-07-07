import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Construction } from "lucide-react"

export default function OperatorSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-800">Impostazioni</h1>
        <p className="text-slate-500">Gestisci le impostazioni del tuo profilo e dei servizi.</p>
      </div>
      <Card className="shadow-xl rounded-2xl">
        <CardHeader>
          <CardTitle>Pagina in Costruzione</CardTitle>
          <CardDescription>
            Stiamo lavorando per rendere questa sezione ancora più completa. Presto potrai modificare qui tutti i
            dettagli del tuo profilo.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center text-center py-16">
          <Construction className="h-16 w-16 text-sky-400 mb-4" />
          <p className="text-lg font-semibold text-slate-700">Work in Progress</p>
          <p className="text-slate-500 mt-2">Grazie per la tua pazienza!</p>
        </CardContent>
      </Card>
    </div>
  )
}
