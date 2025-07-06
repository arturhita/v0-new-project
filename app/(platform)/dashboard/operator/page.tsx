"use client"

import { useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function OperatorDashboardPage() {
  const { profile, loading, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!user || profile?.role !== "operator")) {
      router.push("/login")
    }
  }, [loading, user, profile, router])

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <h1 className="text-3xl font-bold text-white">Bentornato, {profile.full_name}!</h1>
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
              onClick={() => router.push("/dashboard/operator/earnings")}
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
