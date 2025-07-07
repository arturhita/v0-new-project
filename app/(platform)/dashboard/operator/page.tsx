"use client"

import type React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  BarChart,
  Users,
  MessageSquare,
  Star,
  TrendingUp,
  AlertCircle,
  CalendarCheck,
  SparklesIcon,
  Settings,
  DollarSign,
} from "lucide-react"
import Link from "next/link"
import GamificationWidget from "@/components/gamification-widget"
import { useAuth } from "@/contexts/auth-context"

// Mock data for stats - will be replaced with real data later
const operatorStats = {
  totalEarningsMonth: 1250.75,
  pendingConsultations: 3,
  averageRating: 4.8,
  totalConsultationsMonth: 42,
  newClientsMonth: 7,
}

const StatCard = ({
  title,
  value,
  icon: Icon,
  description,
  unit,
  link,
  trend,
  gradient,
}: {
  title: string
  value: string | number
  icon: React.ElementType
  description?: string
  unit?: string
  link?: string
  trend?: "up" | "down" | "neutral"
  gradient?: string
}) => (
  <Card
    className={`backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300 rounded-2xl ${gradient || ""}`}
  >
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-white/90">{title}</CardTitle>
      <Icon className="h-5 w-5 text-white/80" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-white">
        {value}
        {unit && <span className="text-xs text-white/70 ml-1">{unit}</span>}
      </div>
      {description && <p className="text-xs text-white/60 pt-1">{description}</p>}
      {link && (
        <Button variant="link" asChild className="px-0 pt-2 text-white/70 hover:text-white">
          <Link href={link}>Vedi dettagli</Link>
        </Button>
      )}
      {trend && (
        <div
          className={`text-xs mt-1 flex items-center ${trend === "up" ? "text-green-400" : trend === "down" ? "text-red-400" : "text-white/60"}`}
        >
          <TrendingUp className={`h-4 w-4 mr-1 ${trend === "down" ? "transform rotate-180" : ""}`} />
          {trend === "up" ? "+5.2%" : trend === "down" ? "-1.8%" : "Stabile"} vs mese scorso
        </div>
      )}
    </CardContent>
  </Card>
)

export default function OperatorDashboardPage() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('/placeholder.svg?height=1080&width=1920')] opacity-5"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>

      <div className="relative z-10 p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center">
              <SparklesIcon className="w-8 h-8 mr-3 text-yellow-400" />
              Benvenuto nel tuo Santuario, {user?.name || "Operatore"}!
            </h1>
            <p className="text-white/70 text-lg">Ecco una panoramica della tua attività mistica.</p>
          </div>
          <Button className="bg-gradient-to-r from-sky-500 via-teal-500 to-indigo-600 hover:from-sky-400 hover:via-teal-400 hover:to-indigo-500 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 rounded-xl">
            <Link href="/profile/operator" className="flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Modifica Profilo Altare
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <StatCard
            title="Guadagni del Mese"
            value={operatorStats.totalEarningsMonth.toFixed(2)}
            unit="€"
            icon={DollarSign}
            description="Entrate lorde questo mese"
            trend="up"
            gradient="bg-gradient-to-br from-green-500/20 to-green-600/20"
          />
          <StatCard
            title="Valutazione Media"
            value={operatorStats.averageRating.toFixed(1)}
            unit="/ 5"
            icon={Star}
            description={`${operatorStats.totalConsultationsMonth} recensioni totali`}
            link="/dashboard/operator/consultations-history"
            gradient="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20"
          />
          <StatCard
            title="Consulti Mese Corrente"
            value={operatorStats.totalConsultationsMonth}
            icon={CalendarCheck}
            description="Numero di consulti completati"
            trend="neutral"
            gradient="bg-gradient-to-br from-sky-500/20 to-sky-600/20"
          />
          <StatCard
            title="Nuovi Cercatori (Mese)"
            value={operatorStats.newClientsMonth}
            icon={Users}
            description="Clienti che hanno avuto il primo consulto"
            gradient="bg-gradient-to-br from-teal-500/20 to-teal-600/20"
          />
          <StatCard
            title="Consulti Pendenti"
            value={operatorStats.pendingConsultations}
            icon={AlertCircle}
            description="Richieste di consulto da gestire"
            link="/dashboard/operator/written-consultations"
            gradient="bg-gradient-to-br from-orange-500/20 to-orange-600/20"
          />
          <StatCard
            title="Messaggi Non Letti"
            value={3}
            icon={MessageSquare}
            description="Dalla piattaforma e utenti"
            link="/dashboard/operator/platform-messages"
            gradient="bg-gradient-to-br from-indigo-500/20 to-indigo-600/20"
          />
        </div>

        {user && <GamificationWidget userId={user.id} />}

        <Card className="backdrop-blur-xl bg-gradient-to-r from-sky-500/20 via-teal-500/20 to-indigo-500/20 border border-white/20 shadow-2xl rounded-2xl">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center">
              <SparklesIcon className="h-6 w-6 mr-3 text-yellow-400" />
              Configura le Tue Arti
            </CardTitle>
            <CardDescription className="text-white/80 text-base">
              Definisci come desideri offrire i tuoi doni: chat, chiamate, o messaggi scritti.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm w-full sm:w-auto px-6 py-3 rounded-xl shadow-lg"
              asChild
            >
              <Link href="/dashboard/operator/services">Gestisci Modalità Consulto</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Chart Placeholder */}
        <Card className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl rounded-2xl">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center">
              <BarChart className="w-6 h-6 mr-3 text-sky-400" />
              Andamento Consulti (Ultimi 30 Giorni)
            </CardTitle>
            <CardDescription className="text-white/70 text-base">
              Visualizzazione grafica delle tue sessioni.
            </CardDescription>
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
