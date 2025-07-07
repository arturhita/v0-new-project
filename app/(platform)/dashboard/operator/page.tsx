"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Loader2, AlertCircle, MessageSquare, Euro, Briefcase } from "lucide-react"
import { getOperatorDashboardData } from "@/lib/actions/operator.actions"

interface DashboardData {
  monthlyEarnings: number
  consultationsCount: number
  unreadMessagesCount: number
}

const StatCardSkeleton = () => (
  <Card className="animate-pulse">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <div className="h-5 w-2/5 rounded-md bg-gray-200 dark:bg-gray-700" />
      <div className="h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-700" />
    </CardHeader>
    <CardContent>
      <div className="h-10 w-3/5 rounded-md bg-gray-300 dark:bg-gray-600" />
      <div className="mt-2 h-4 w-4/5 rounded-md bg-gray-200 dark:bg-gray-700" />
    </CardContent>
  </Card>
)

export default function OperatorDashboardPage() {
  const { profile, loading: authLoading, user } = useAuth()
  const router = useRouter()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && (!user || profile?.role !== "operator")) {
      router.push("/login")
    }
  }, [authLoading, user, profile, router])

  useEffect(() => {
    if (profile?.id) {
      const fetchData = async () => {
        setLoading(true)
        setError(null)
        const result = await getOperatorDashboardData(profile.id)
        if (result.success && result.data) {
          setData(result.data)
        } else {
          setError(result.message || "Impossibile caricare i dati della dashboard.")
        }
        setLoading(false)
      }
      fetchData()
    }
  }, [profile?.id])

  if (authLoading || !profile) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Bentornato, {profile.full_name}!</h1>
      <p className="text-gray-600 dark:text-gray-400">Questa è la tua panoramica in tempo reale.</p>

      {error && (
        <div className="flex items-center gap-x-2 rounded-md border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-500 dark:text-red-400">
          <AlertCircle className="h-4 w-4" />
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Guadagni del Mese
                </CardTitle>
                <Euro className="h-5 w-5 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{data?.monthlyEarnings.toFixed(2) ?? "0.00"} €</div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Guadagni netti per il mese corrente</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Consulti Completati
                </CardTitle>
                <Briefcase className="h-5 w-5 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">+{data?.consultationsCount ?? 0}</div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Nel mese corrente</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Messaggi Non Letti
                </CardTitle>
                <MessageSquare className="h-5 w-5 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{data?.unreadMessagesCount ?? 0}</div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Totale messaggi da leggere</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Azioni Rapide</h2>
        <div className="flex flex-wrap gap-4">
          <Button onClick={() => router.push("/platform/dashboard/operator/availability")}>
            Gestisci Disponibilità
          </Button>
          <Button onClick={() => router.push("/platform/dashboard/operator/internal-messages")} variant="outline">
            Vai ai Messaggi
          </Button>
        </div>
      </div>
    </div>
  )
}
