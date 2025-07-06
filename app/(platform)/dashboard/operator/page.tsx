"use client"

import { useAuth } from "@/contexts/auth-context"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function OperatorDashboardPage() {
  const { user, profile, loading, logout } = useAuth()
  const router = useRouter()

  if (loading) {
    return <div>Caricamento...</div>
  }

  if (!user) {
    // This should be handled by the AuthProvider, but as a fallback
    router.push("/(platform)/login")
    return null
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Benvenuto, Operatore {profile?.name || user.email}!
        </h1>
        <Button onClick={logout} variant="outline">
          Logout
        </Button>
      </div>
      <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
        Gestisci la tua attività, la disponibilità e le consulenze da questa dashboard.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Disponibilità</CardTitle>
            <CardDescription>Imposta i tuoi orari di lavoro.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Sei attualmente online.</p>
            <Button className="mt-4" onClick={() => router.push("/(platform)/dashboard/operator/availability")}>
              Gestisci Disponibilità
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Guadagni</CardTitle>
            <CardDescription>Visualizza i tuoi guadagni e le statistiche.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">€ 1,250.00</p>
            <Button className="mt-4" onClick={() => router.push("/(platform)/dashboard/operator/earnings")}>
              Vedi Dettagli
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Messaggi Interni</CardTitle>
            <CardDescription>Comunicazioni dalla piattaforma.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Nessun nuovo messaggio.</p>
            <Button className="mt-4" onClick={() => router.push("/(platform)/dashboard/operator/internal-messages")}>
              Apri Messaggi
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
