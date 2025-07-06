"use client"

import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import {
  Activity,
  Briefcase,
  DollarSign,
  FileText,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  UserCheck,
  Users,
  Zap,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const kpiData = [
  {
    title: "Entrate del Mese",
    value: "€12,450",
    change: "+15.2%",
    icon: DollarSign,
    color: "text-green-400",
  },
  {
    title: "Operatori in Attesa",
    value: "3",
    change: "Da approvare",
    icon: UserCheck,
    color: "text-yellow-400",
  },
  {
    title: "Utenti Attivi",
    value: "1,482",
    change: "+5.8%",
    icon: Users,
    color: "text-sky-400",
  },
  {
    title: "Consulenze Oggi",
    value: "47",
    change: "-3.1% vs ieri",
    icon: Sparkles,
    color: "text-purple-400",
  },
]

const revenueData = [
  { name: "Gen", Fatturato: 4000 },
  { name: "Feb", Fatturato: 3000 },
  { name: "Mar", Fatturato: 5000 },
  { name: "Apr", Fatturato: 4500 },
  { name: "Mag", Fatturato: 6000 },
  { name: "Giu", Fatturato: 5500 },
  { name: "Lug", Fatturato: 7000 },
]

const operatorPerformanceData = [
  { name: "Stella Divina", Consulenze: 89, Rating: 4.9 },
  { name: "Eclissi Astrale", Consulenze: 75, Rating: 4.8 },
  { name: "Cosmo Intuitivo", Consulenze: 68, Rating: 4.9 },
  { name: "Sentiero Luminoso", Consulenze: 62, Rating: 4.7 },
  { name: "Oracolo Silente", Consulenze: 51, Rating: 5.0 },
]

const recentActivities = [
  { icon: Users, text: "Nuovo utente registrato: 'ViaggiatoreSognante'", time: "2m fa" },
  { icon: Briefcase, text: "Nuova candidatura operatore: 'Luce Cosmica'", time: "15m fa" },
  { icon: Star, text: "Recensione a 5 stelle per 'Stella Divina'", time: "30m fa" },
  { icon: DollarSign, text: "Pagamento di €45.00 completato da 'AnimaInCerca'", time: "1h fa" },
  { icon: FileText, text: "Richiesta di consulto scritto ricevuta", time: "2h fa" },
]

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300">
        Santuario dell'Amministratore
      </h1>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {kpiData.map((kpi) => (
          <Card key={kpi.title} className="bg-slate-800/50 border-indigo-500/20 backdrop-blur-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">{kpi.title}</CardTitle>
              <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{kpi.value}</div>
              <p className="text-xs text-slate-400 mt-1">{kpi.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Charts Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Revenue Chart */}
          <Card className="bg-slate-800/50 border-indigo-500/20 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-lg text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300 flex items-center">
                <TrendingUp className="mr-2 h-5 w-5" /> Andamento Fatturato
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#818cf8" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={(value) => `€${value}`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(30, 41, 59, 0.9)",
                      borderColor: "#4f46e5",
                      color: "#e2e8f0",
                    }}
                  />
                  <Area type="monotone" dataKey="Fatturato" stroke="#818cf8" fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Operator Performance */}
          <Card className="bg-slate-800/50 border-indigo-500/20 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-lg text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300 flex items-center">
                <Star className="mr-2 h-5 w-5" /> Performance Operatori
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={operatorPerformanceData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                  <XAxis type="number" stroke="#9ca3af" fontSize={12} />
                  <YAxis type="category" dataKey="name" width={120} stroke="#9ca3af" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(30, 41, 59, 0.9)",
                      borderColor: "#4f46e5",
                      color: "#e2e8f0",
                    }}
                  />
                  <Bar dataKey="Consulenze" fill="#6366f1" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Side Column */}
        <div className="space-y-8">
          {/* Quick Actions */}
          <Card className="bg-slate-800/50 border-indigo-500/20 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-lg text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300 flex items-center">
                <Zap className="mr-2 h-5 w-5" /> Azioni Rapide
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <Link href="/admin/operator-approvals">
                <Button
                  variant="outline"
                  className="w-full h-20 flex-col gap-1 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10 hover:text-white bg-transparent"
                >
                  <UserCheck className="h-6 w-6" />
                  <span>Approva Operatori</span>
                </Button>
              </Link>
              <Link href="/admin/users">
                <Button
                  variant="outline"
                  className="w-full h-20 flex-col gap-1 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10 hover:text-white bg-transparent"
                >
                  <Users className="h-6 w-6" />
                  <span>Gestisci Utenti</span>
                </Button>
              </Link>
              <Link href="/admin/reviews">
                <Button
                  variant="outline"
                  className="w-full h-20 flex-col gap-1 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10 hover:text-white bg-transparent"
                >
                  <Star className="h-6 w-6" />
                  <span>Modera Recensioni</span>
                </Button>
              </Link>
              <Link href="/admin/settings">
                <Button
                  variant="outline"
                  className="w-full h-20 flex-col gap-1 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10 hover:text-white bg-transparent"
                >
                  <ShieldCheck className="h-6 w-6" />
                  <span>Impostazioni</span>
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-slate-800/50 border-indigo-500/20 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-lg text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300 flex items-center">
                <Activity className="mr-2 h-5 w-5" /> Attività Recente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="bg-slate-700/50 p-2 rounded-full">
                      <activity.icon className="h-5 w-5 text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-200">{activity.text}</p>
                      <p className="text-xs text-slate-400">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
