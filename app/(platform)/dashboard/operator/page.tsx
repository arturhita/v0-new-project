"use client"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function OperatorDashboardPage() {
  const { profile, loading } = useAuth()
  const router = useRouter()

  if (loading) {
    return <div>Caricamento in corso...</div>
  }

  if (!profile) {
    return <div>Profilo non trovato.</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Bentornato, {profile.name}!</h1>
      <p className="text-gray-400">Questa è la tua dashboard operatore.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-gray-800 border-gray-700 text-white">
          <CardHeader>
            <CardTitle>Stato Attuale</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-400">Disponibile</p>
            <Button className="mt-4 bg-red-600 hover:bg-red-700">Passa a Occupato</Button>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700 text-white">
          <CardHeader>
            <CardTitle>Richieste di Chat</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Nessuna nuova richiesta.</p>
            <Button disabled className="mt-4 bg-gray-700">
              Visualizza Coda
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700 text-white">
          <CardHeader>
            <CardTitle>Guadagni del Mese</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">€ 1,250.00</p>
            <Button
              onClick={() => router.push("/(platform)/dashboard/operator/earnings")}
              className="mt-4 bg-gray-700 hover:bg-gray-600"
            >
              Dettagli Guadagni
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
