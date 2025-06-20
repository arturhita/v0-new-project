import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Info, X } from "lucide-react"

const alerts = [
  {
    id: 1,
    type: "warning",
    title: "Alta richiesta categoria Legale",
    description:
      "La categoria Legale ha il 150% di richieste in più rispetto alla media. Considera di reclutare più operatori.",
    action: "Visualizza dettagli",
    icon: AlertTriangle,
  },
  {
    id: 2,
    type: "info",
    title: "Aggiornamento sistema programmato",
    description: "Manutenzione programmata per domenica 15 dicembre dalle 02:00 alle 04:00.",
    action: "Programma notifica",
    icon: Info,
  },
]

export function SystemAlerts() {
  if (alerts.length === 0) return null

  return (
    <div className="space-y-4">
      {alerts.map((alert) => {
        const Icon = alert.icon
        return (
          <Alert
            key={alert.id}
            className={`${
              alert.type === "warning"
                ? "border-orange-200 bg-orange-50"
                : alert.type === "error"
                  ? "border-red-200 bg-red-50"
                  : "border-blue-200 bg-blue-50"
            }`}
          >
            <Icon
              className={`h-4 w-4 ${
                alert.type === "warning" ? "text-orange-600" : alert.type === "error" ? "text-red-600" : "text-blue-600"
              }`}
            />
            <div className="flex-1">
              <AlertTitle>{alert.title}</AlertTitle>
              <AlertDescription className="mt-1">{alert.description}</AlertDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button size="sm" variant="outline">
                {alert.action}
              </Button>
              <Button size="sm" variant="ghost">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </Alert>
        )
      })}
    </div>
  )
}
