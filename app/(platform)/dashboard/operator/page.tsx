"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Star, Settings, DollarSign, CalendarCheck, SparklesIcon, BarChart } from "lucide-react"
import Link from "next/link"
import GamificationWidget from "@/components/gamification-widget"
import { useAuth } from "@/contexts/auth-context"
import { getOperatorDashboardStats } from "@/lib/actions/dashboard.actions"
import { Skeleton } from "@/components/ui/skeleton"

const StatCard = ({
  title,
  value,
  icon: Icon,
  unit,
  gradient,
  isLoading,
}: {
  title: string
  value: string | number
  icon: React.ElementType
  unit?: string
  gradient?: string
  isLoading: boolean
}) => (
  <Card
    className={`backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300 rounded-2xl ${gradient || ""}`}
  >
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-white/90">{title}</CardTitle>
      <Icon className="h-5 w-5 text-white/80" />
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <Skeleton className="h-8 w-24 mt-1" />
      ) : (
        <div className="text-2xl font-bold text-white">
          {value}
          {unit && <span className="text-xs text-white/70 ml-1">{unit}</span>}
        </div>
      )}
    </CardContent>
  </Card>
)

export default function OperatorDashboardPage() {
  const { user, profile } = useAuth()
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user?.id) {
      getOperatorDashboardStats(user.id)
        .then((data) => {
          setStats(data)
          setIsLoading(false)
        })
        .catch(console.error)
    }
  }, [user])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/placeholder.svg?height=1080&width=1920')] opacity-5"></div>
      <div className="relative z-10 p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center">
              <SparklesIcon className="w-8 h-8 mr-3 text-yellow-400" />
              Benvenuto, {profile?.full_name || "Operatore"}!
            </h1>
            <p className="text-white/70 text-lg">Ecco una panoramica della tua attività.</p>
          </div>
          <Button
            asChild
            className="bg-gradient-to-r from-sky-500 via-teal-500 to-indigo-600 hover:from-sky-400 hover:via-teal-400 hover:to-indigo-500 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 rounded-xl"
          >
            <Link href="/dashboard/operator/settings">
              <Settings className="w-5 h-5 mr-2" />
              Modifica Profilo e Servizi
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Guadagni Totali"
            value={stats?.totalEarnings.toFixed(2) || 0}
            unit="€"
            icon={DollarSign}
            isLoading={isLoading}
            gradient="bg-gradient-to-br from-green-500/20 to-green-600/20"
          />
          <StatCard
            title="Valutazione Media"
            value={stats?.averageRating || 0}
            unit={`/ 5 (${stats?.totalReviews || 0} rec.)`}
            icon={Star}
            isLoading={isLoading}
            gradient="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20"
          />
          <StatCard
            title="Consulti Completati"
            value={stats?.totalConsultations || 0}
            icon={CalendarCheck}
            isLoading={isLoading}
            gradient="bg-gradient-to-br from-sky-500/20 to-sky-600/20"
          />
          <StatCard
            title="Nuovi Clienti (da fare)"
            value={0}
            icon={Users}
            isLoading={isLoading}
            gradient="bg-gradient-to-br from-teal-500/20 to-teal-600/20"
          />
        </div>

        <GamificationWidget userId={user?.id || ""} />

        <Card className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl rounded-2xl">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center">
              <BarChart className="w-6 h-6 mr-3 text-sky-400" />
              Andamento Consulti (Ultimi 30 Giorni)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
              <p className="text-white/60">Grafico Andamento Consulti (Placeholder)</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
