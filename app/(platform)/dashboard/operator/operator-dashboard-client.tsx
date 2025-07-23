"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

// A plausible structure for the dashboard data
interface DashboardData {
  total_earnings: number
  total_consultations: number
  average_rating: number
  profile: {
    is_online: boolean
    // other profile fields...
  }
  // other stats...
}

export function OperatorDashboardClient({ initialData }: { initialData: DashboardData }) {
  // Poiché i dati sono stati sanificati sul server, è sicuro usarli nello stato
  // e modificarli negli gestori di eventi senza causare l'errore "getter".
  const [isOnline, setIsOnline] = useState(initialData.profile.is_online)

  const handleAvailabilityChange = async (checked: boolean) => {
    setIsOnline(checked)
    // Qui tipicamente chiameresti un'azione server per aggiornare lo stato nel DB
    // Esempio: await updateUserAvailability(checked);
    console.log(`Disponibilità operatore impostata a: ${checked}`)
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">La tua Dashboard</h1>
        <div className="flex items-center space-x-2">
          <Switch id="availability-toggle" checked={isOnline} onCheckedChange={handleAvailabilityChange} />
          <Label htmlFor="availability-toggle" className={isOnline ? "text-green-500" : "text-red-500"}>
            {isOnline ? "Disponibile" : "Non Disponibile"}
          </Label>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Guadagni Totali</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">€{initialData.total_earnings?.toFixed(2) || "0.00"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Consulti Totali</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{initialData.total_consultations || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Valutazione Media</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{initialData.average_rating?.toFixed(1) || "N/A"}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
