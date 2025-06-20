"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
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
  ResponsiveContainer,
} from "recharts"
import { Download, TrendingUp, Users, Euro, MessageSquare, Filter } from "lucide-react"

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<any>(null)
  const [selectedMetric, setSelectedMetric] = useState("revenue")

  // Sample data
  const revenueData = [
    { month: "Gen", revenue: 12400, consultations: 234, users: 1200 },
    { month: "Feb", revenue: 15600, consultations: 289, users: 1450 },
    { month: "Mar", revenue: 18900, consultations: 356, users: 1680 },
    { month: "Apr", revenue: 22100, consultations: 412, users: 1890 },
    { month: "Mag", revenue: 25800, consultations: 478, users: 2100 },
    { month: "Giu", revenue: 28400, consultations: 523, users: 2340 },
    { month: "Lug", revenue: 31200, consultations: 589, users: 2580 },
    { month: "Ago", revenue: 29800, consultations: 567, users: 2490 },
    { month: "Set", revenue: 33600, consultations: 634, users: 2720 },
    { month: "Ott", revenue: 36900, consultations: 698, users: 2950 },
    { month: "Nov", revenue: 39400, consultations: 745, users: 3180 },
    { month: "Dic", revenue: 42100, consultations: 798, users: 3420 },
  ]

  const consultationTypes = [
    { name: "Tarocchi", value: 45, color: "#8884d8" },
    { name: "Astrologia", value: 28, color: "#82ca9d" },
    { name: "Cartomanzia", value: 18, color: "#ffc658" },
    { name: "Numerologia", value: 9, color: "#ff7300" },
  ]

  const hourlyData = [
    { hour: "00", consultations: 12 },
    { hour: "01", consultations: 8 },
    { hour: "02", consultations: 5 },
    { hour: "03", consultations: 3 },
    { hour: "04", consultations: 2 },
    { hour: "05", consultations: 4 },
    { hour: "06", consultations: 8 },
    { hour: "07", consultations: 15 },
    { hour: "08", consultations: 25 },
    { hour: "09", consultations: 35 },
    { hour: "10", consultations: 45 },
    { hour: "11", consultations: 52 },
    { hour: "12", consultations: 48 },
    { hour: "13", consultations: 42 },
    { hour: "14", consultations: 55 },
    { hour: "15", consultations: 62 },
    { hour: "16", consultations: 58 },
    { hour: "17", consultations: 65 },
    { hour: "18", consultations: 72 },
    { hour: "19", consultations: 68 },
    { hour: "20", consultations: 75 },
    { hour: "21", consultations: 82 },
    { hour: "22", consultations: 45 },
    { hour: "23", consultations: 28 },
  ]

  const topConsultants = [
    { name: "Luna Stellare", consultations: 256, revenue: 6400, rating: 4.9 },
    { name: "Maestro Cosmos", consultations: 189, revenue: 4725, rating: 4.8 },
    { name: "Cristal Mystic", consultations: 167, revenue: 4175, rating: 4.7 },
    { name: "Sage Oracle", consultations: 145, revenue: 3625, rating: 4.6 },
    { name: "Divine Reader", consultations: 134, revenue: 3350, rating: 4.8 },
  ]

  const exportData = (format: string) => {
    console.log(`Esportazione dati in formato ${format}`)
    // Implementa logica di esportazione
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
            Analytics & Reportistica
          </h2>
          <p className="text-muted-foreground">Analisi dettagliata delle performance della piattaforma</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => exportData("csv")}>
            <Download className="mr-2 h-4 w-4" />
            CSV
          </Button>
          <Button variant="outline" onClick={() => exportData("excel")}>
            <Download className="mr-2 h-4 w-4" />
            Excel
          </Button>
          <Button variant="outline" onClick={() => exportData("pdf")}>
            <Download className="mr-2 h-4 w-4" />
            PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Filtri Analisi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <DatePickerWithRange />
            </div>
            <Select value={selectedMetric} onValueChange={setSelectedMetric}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Seleziona metrica" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="revenue">Ricavi</SelectItem>
                <SelectItem value="consultations">Consulenze</SelectItem>
                <SelectItem value="users">Utenti</SelectItem>
                <SelectItem value="all">Tutte le metriche</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ricavi Totali</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€145,231</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+18.2%</span> dal mese scorso
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consulenze Totali</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6,234</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12.5%</span> dal mese scorso
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utenti Attivi</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3,420</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8.1%</span> dal mese scorso
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasso Conversione</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24.8%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+2.1%</span> dal mese scorso
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Panoramica</TabsTrigger>
          <TabsTrigger value="revenue">Ricavi</TabsTrigger>
          <TabsTrigger value="consultations">Consulenze</TabsTrigger>
          <TabsTrigger value="users">Utenti</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Trend Ricavi Mensili</CardTitle>
                <CardDescription>Andamento ricavi negli ultimi 12 mesi</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    revenue: {
                      label: "Ricavi",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="var(--color-revenue)"
                        fill="var(--color-revenue)"
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribuzione Consulenze</CardTitle>
                <CardDescription>Tipologie di consulenze più richieste</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    tarocchi: { label: "Tarocchi", color: "#8884d8" },
                    astrologia: { label: "Astrologia", color: "#82ca9d" },
                    cartomanzia: { label: "Cartomanzia", color: "#ffc658" },
                    numerologia: { label: "Numerologia", color: "#ff7300" },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={consultationTypes}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {consultationTypes.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analisi Ricavi Dettagliata</CardTitle>
              <CardDescription>Ricavi mensili con trend e proiezioni</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  revenue: {
                    label: "Ricavi",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-[400px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="var(--color-revenue)"
                      strokeWidth={3}
                      dot={{ fill: "var(--color-revenue)" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consultations" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Consulenze per Ora</CardTitle>
                <CardDescription>Distribuzione oraria delle consulenze</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    consultations: {
                      label: "Consulenze",
                      color: "hsl(var(--chart-2))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={hourlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="consultations" fill="var(--color-consultations)" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Consulenti</CardTitle>
                <CardDescription>Consulenti con più consulenze</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topConsultants.map((consultant, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{consultant.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {consultant.consultations} consulenze • Rating {consultant.rating}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-600">€{consultant.revenue}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Crescita Utenti</CardTitle>
              <CardDescription>Andamento registrazioni utenti</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  users: {
                    label: "Utenti",
                    color: "hsl(var(--chart-3))",
                  },
                }}
                className="h-[400px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="users"
                      stroke="var(--color-users)"
                      fill="var(--color-users)"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Metriche Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm">Tempo medio risposta</span>
                  <span className="font-medium">2.3s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Uptime sistema</span>
                  <span className="font-medium text-green-600">99.8%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Soddisfazione utenti</span>
                  <span className="font-medium">4.7/5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Tasso completamento</span>
                  <span className="font-medium">94.2%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Qualità Servizio</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm">Rating medio consulenti</span>
                  <span className="font-medium">4.6/5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Consulenze completate</span>
                  <span className="font-medium text-green-600">98.1%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Tempo medio consulenza</span>
                  <span className="font-medium">18.5 min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Reclami risolti</span>
                  <span className="font-medium">99.2%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Crescita</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm">Crescita MoM ricavi</span>
                  <span className="font-medium text-green-600">+18.2%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Nuovi utenti MoM</span>
                  <span className="font-medium text-green-600">+12.5%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Retention rate</span>
                  <span className="font-medium">76.3%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Churn rate</span>
                  <span className="font-medium text-red-600">3.2%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
