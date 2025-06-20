"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Clock, Star, CreditCard, Users, Calendar, SnowflakeIcon as Crystal, Sparkles } from "lucide-react"

export default function UserDashboard() {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
          Benvenuto nel mondo esoterico, Mario!
        </h1>
        <p className="text-muted-foreground mt-2">Scopri il tuo futuro con i nostri consulenti esperti</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 bg-gradient-to-r from-pink-500 to-pink-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Crediti Disponibili</CardTitle>
            <CreditCard className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€45.50</div>
            <Button variant="link" className="p-0 h-auto text-xs text-pink-100 hover:text-white">
              Ricarica crediti
            </Button>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consulenze Totali</CardTitle>
            <Sparkles className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-blue-100">+3 questo mese</p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Totale</CardTitle>
            <Clock className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8h 45m</div>
            <p className="text-xs text-purple-100">Di consulenze</p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recensioni Lasciate</CardTitle>
            <Star className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-indigo-100">Media 4.8 stelle</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Activity */}
        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
              <TrendingUp className="mr-2 h-5 w-5 text-pink-500" />
              Attività Recente
            </CardTitle>
            <CardDescription>Le tue ultime azioni sulla piattaforma</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                action: "Consulenza completata",
                details: "con Luna Stellare - Tarocchi Amore",
                time: "2 ore fa",
                type: "consultation",
              },
              {
                action: "Recensione pubblicata",
                details: "5 stelle per Maestro Cosmos",
                time: "1 giorno fa",
                type: "review",
              },
              {
                action: "Crediti ricaricati",
                details: "€50.00 aggiunti al saldo",
                time: "3 giorni fa",
                type: "credit",
              },
              {
                action: "Profilo aggiornato",
                details: "Nickname cambiato in @mario_mystic",
                time: "1 settimana fa",
                type: "profile",
              },
            ].map((activity, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-pink-50 transition-colors"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-pink-100 to-blue-100">
                  {activity.type === "consultation" && <Crystal className="h-4 w-4 text-pink-600" />}
                  {activity.type === "review" && <Star className="h-4 w-4 text-yellow-600" />}
                  {activity.type === "credit" && <CreditCard className="h-4 w-4 text-green-600" />}
                  {activity.type === "profile" && <Users className="h-4 w-4 text-blue-600" />}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{activity.action}</p>
                  <p className="text-sm text-gray-600">{activity.details}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
              <Calendar className="mr-2 h-5 w-5 text-blue-500" />
              Statistiche Mensili
            </CardTitle>
            <CardDescription>I tuoi dati di questo mese</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Consulenze completate</span>
                <Badge className="bg-green-100 text-green-800">3</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Tempo totale consulenze</span>
                <Badge className="bg-blue-100 text-blue-800">1h 15m</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Spesa totale</span>
                <Badge className="bg-purple-100 text-purple-800">€158.40</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Recensioni lasciate</span>
                <Badge className="bg-yellow-100 text-yellow-800">2</Badge>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-medium text-gray-900 mb-3">Categorie più consultate</h4>
              <div className="space-y-2">
                {[
                  { name: "Tarocchi Amore", count: 2, color: "bg-pink-500" },
                  { name: "Oroscopo", count: 1, color: "bg-blue-500" },
                ].map((category) => (
                  <div key={category.name} className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${category.color}`} />
                    <span className="text-sm text-gray-700 flex-1">{category.name}</span>
                    <span className="text-sm font-medium text-gray-900">{category.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Esoteric Categories */}
      <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
            Consulenze Esoteriche
          </CardTitle>
          <CardDescription>Scegli il tipo di consulenza che preferisci</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "Cartomanzia", icon: "🔮", experts: 89, color: "from-pink-400 to-pink-600" },
              { name: "Astrologia", icon: "⭐", experts: 67, color: "from-blue-400 to-blue-600" },
              { name: "Tarocchi", icon: "🃏", experts: 134, color: "from-purple-400 to-purple-600" },
              { name: "Sensitivi", icon: "🌙", experts: 78, color: "from-indigo-400 to-indigo-600" },
              { name: "Numerologia", icon: "🔢", experts: 45, color: "from-teal-400 to-teal-600" },
              { name: "Cristalli", icon: "💎", experts: 56, color: "from-emerald-400 to-emerald-600" },
              { name: "Rune", icon: "🪬", experts: 34, color: "from-amber-400 to-amber-600" },
              { name: "Pendolo", icon: "⚖️", experts: 29, color: "from-rose-400 to-rose-600" },
            ].map((category) => (
              <Button
                key={category.name}
                variant="outline"
                className="h-20 flex-col space-y-2 hover:shadow-md transition-all duration-300 border-pink-100 hover:bg-gradient-to-r hover:from-pink-50 hover:to-blue-50"
                onClick={() =>
                  (window.location.href = `/dashboard/user/search?category=${category.name.toLowerCase()}`)
                }
              >
                <div className="text-2xl">{category.icon}</div>
                <div className="text-center">
                  <div className="font-medium text-gray-800">{category.name}</div>
                  <div className="text-xs text-muted-foreground">{category.experts} consulenti</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
