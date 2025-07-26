"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Info, Calendar, Clock, Euro } from "lucide-react"

export function PayoutPolicyInfo() {
  return (
    <Card className="shadow-lg rounded-2xl border-l-4 border-l-blue-500 bg-blue-50/30">
      <CardHeader>
        <CardTitle className="text-lg text-slate-700 flex items-center">
          <Info className="mr-2 h-5 w-5 text-blue-600" />
          Politica Pagamenti
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start space-x-3">
            <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-slate-700">Frequenza Richieste</h4>
              <p className="text-sm text-slate-600">Una richiesta ogni 15 giorni</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Euro className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-slate-700">Importo Minimo</h4>
              <p className="text-sm text-slate-600">€10.00 per richiesta</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Clock className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-slate-700">Tempi di Elaborazione</h4>
              <p className="text-sm text-slate-600">3-5 giorni lavorativi</p>
            </div>
          </div>
        </div>

        <div className="bg-white/60 p-3 rounded-lg border">
          <p className="text-sm text-slate-600">
            <strong>Nota:</strong> Le richieste di pagamento sono elaborate dal nostro team amministrativo. Riceverai
            una notifica via email quando la tua richiesta sarà approvata e processata.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
