import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building, Euro, TrendingUp, Phone, Clock } from "lucide-react"
import { getCallHistoryAction } from "@/lib/actions/calls.actions"
import type { CallSession } from "@/lib/twilio"

const formatDuration = (seconds = 0) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}m ${secs}s`
}

export default async function OperatorCallsPage() {
  const callHistory: CallSession[] = await getCallHistoryAction("op123", "operator")

  const totalEarnings = callHistory.reduce((acc, call) => acc + (call.operatorEarning || 0), 0)
  const totalPlatformFees = callHistory.reduce((acc, call) => acc + (call.platformFee || 0), 0)
  const totalRevenue = totalEarnings + totalPlatformFees

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Dashboard Chiamate</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Guadagni Totali</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">€{totalEarnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Dalle chiamate completate</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commissioni Piattaforma</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{totalPlatformFees.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Trattenute dalla piattaforma</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fatturato Generato</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Valore totale delle chiamate</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" /> Storico Chiamate Ricevute
          </CardTitle>
        </CardHeader>
        <CardContent>
          {callHistory.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Nessuna chiamata ricevuta.</p>
          ) : (
            <div className="space-y-4">
              {callHistory.map((call) => (
                <div key={call.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">
                      Chiamata da Cliente <span className="font-mono text-xs">{call.clientId}</span>
                    </p>
                    <p className="text-sm text-muted-foreground">{new Date(call.createdAt).toLocaleString("it-IT")}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 font-semibold text-green-600">
                      + €{call.operatorEarning?.toFixed(2) || "0.00"}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" /> {formatDuration(call.duration)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
