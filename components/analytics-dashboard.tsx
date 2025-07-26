"use client"
import { useState } from "react"
import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { TrendingUp, TrendingDown, Users, DollarSign, MessageSquare, Star, Download, Target } from "lucide-react"

// Dati mock per analytics
const revenueData = [
  { month: "Gen", revenue: 12400, consultations: 156, newUsers: 89 },
  { month: "Feb", revenue: 15600, consultations: 198, newUsers: 112 },
  { month: "Mar", revenue: 18900, consultations: 234, newUsers: 145 },
  { month: "Apr", revenue: 22100, consultations: 287, newUsers: 167 },
  { month: "Mag", revenue: 25800, consultations: 321, newUsers: 189 },
  { month: "Giu", revenue: 28400, consultations: 356, newUsers: 203 },
]

const categoryData = [
  { name: "Tarocchi", value: 35, color: "#8B5CF6" },
  { name: "Astrologia", value: 28, color: "#06B6D4" },
  { name: "Numerologia", value: 18, color: "#10B981" },
  { name: "Cartomanzia", value: 12, color: "#F59E0B" },
  { name: "Altro", value: 7, color: "#EF4444" },
]

const operatorPerformance = [
  { name: "Stella Divina", consultations: 89, rating: 4.9, revenue: 2340 },
  { name: "Oracolo Celeste", consultations: 76, rating: 4.8, revenue: 2100 },
  { name: "Mago Elara", consultations: 65, rating: 4.7, revenue: 1890 },
  { name: "Seraphina", consultations: 54, rating: 4.6, revenue: 1650 },
]

interface MetricCardProps {
  title: string
  value: string | number
  change: number
  icon: React.ElementType
  color: string
}

const MetricCard = ({ title, value, change, icon: Icon, color }: MetricCardProps) => (
  <Card className="shadow-lg hover:shadow-xl transition-shadow">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-slate-600">{title}</CardTitle>
      <Icon className={`h-5 w-5 ${color}`} />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-slate-800">{value}</div>
      <div className="flex items-center text-xs mt-1">
        {change > 0 ? (
          <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
        ) : (
          <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
        )}
        <span className={change > 0 ? "text-green-600" : "text-red-600"}>{Math.abs(change)}% vs mese scorso</span>
      </div>
    </CardContent>
  </Card>
)

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState("6months")
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    // Simula export
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsExporting(false)
    alert("Report esportato con successo!")
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Analytics Avanzate</h1>
          <p className="text-slate-600 mt-1">Dashboard completa delle performance</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Ultimi 7 giorni</SelectItem>
              <SelectItem value="30days">Ultimi 30 giorni</SelectItem>
              <SelectItem value="6months">Ultimi 6 mesi</SelectItem>
              <SelectItem value="1year">Ultimo anno</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="bg-gradient-to-r from-sky-500 to-cyan-500 text-white"
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? "Esportando..." : "Esporta Report"}
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Fatturato Totale" value="€28,400" change={12.5} icon={DollarSign} color="text-green-500" />
        <MetricCard title="Consulti Totali" value="356" change={8.2} icon={MessageSquare} color="text-blue-500" />
        <MetricCard title="Nuovi Utenti" value="203" change={15.3} icon={Users} color="text-purple-500" />
        <MetricCard title="Rating Medio" value="4.8" change={2.1} icon={Star} color="text-yellow-500" />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Andamento Fatturato
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`€${value}`, "Fatturato"]} />
                <Area type="monotone" dataKey="revenue" stroke="#06B6D4" fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-500" />
              Distribuzione Categorie
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Consultations Trend */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              Consulti & Nuovi Utenti
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="consultations" stroke="#3B82F6" strokeWidth={3} name="Consulti" />
                <Line type="monotone" dataKey="newUsers" stroke="#10B981" strokeWidth={3} name="Nuovi Utenti" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Operators */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-orange-500" />
              Top Operatori
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={operatorPerformance} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={80} />
                <Tooltip />
                <Bar dataKey="consultations" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats Table */}
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle>Performance Dettagliate Operatori</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Operatore</th>
                  <th className="text-center p-3">Consulti</th>
                  <th className="text-center p-3">Rating</th>
                  <th className="text-right p-3">Fatturato</th>
                  <th className="text-center p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {operatorPerformance.map((op, index) => (
                  <tr key={index} className="border-b hover:bg-slate-50">
                    <td className="p-3 font-medium">{op.name}</td>
                    <td className="p-3 text-center">{op.consultations}</td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        {op.rating}
                      </div>
                    </td>
                    <td className="p-3 text-right font-semibold">€{op.revenue}</td>
                    <td className="p-3 text-center">
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Attivo
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
