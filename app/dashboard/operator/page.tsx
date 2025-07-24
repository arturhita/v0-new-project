"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DollarSign, Users, Star, Clock, MessageSquare, Sparkles } from "lucide-react"
import { Overview } from "@/components/overview"
import { RecentActivity } from "@/components/recent-activity"

export default async function OperatorDashboardPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, operator_profiles(*)")
    .eq("id", user.id)
    .single()

  // In a real app, you would fetch these stats from your database
  const stats = {
    monthlyEarnings: profile?.operator_profiles?.earnings || 0,
    totalClients: 0, // Replace with actual query
    averageRating: profile?.operator_profiles?.average_rating || 0,
    hoursThisWeek: 0, // Replace with actual query
  }

  const welcomeName = profile?.full_name?.split(" ")[0] || "Consulente"
  const [isOnline] = useState(true)

  return (
    <div className="space-y-6 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Bentornato, {welcomeName}!</h1>
          <p className="text-gray-600">Questa è la tua centrale di comando per le consulenze.</p>
        </div>
        <Badge variant={isOnline ? "default" : "secondary"} className={isOnline ? "bg-green-500" : ""}>
          {isOnline ? "Online" : "Offline"}
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 bg-gradient-to-r from-pink-500 to-pink-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Guadagni Oggi</CardTitle>
            <DollarSign className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€127.50</div>
            <p className="text-xs text-pink-100">+15% da ieri</p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consulenze Oggi</CardTitle>
            <Sparkles className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-blue-100">3 completate</p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messaggi Non Letti</CardTitle>
            <MessageSquare className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-purple-100">Da 3 clienti</p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rating Medio</CardTitle>
            <Star className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center">
              4.9
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400 ml-1" />
            </div>
            <p className="text-xs text-indigo-100">256 recensioni</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Guadagni (Mese)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{stats.monthlyEarnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">+20.1% dal mese scorso</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clienti Totali</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{stats.totalClients}</div>
            <p className="text-xs text-muted-foreground">Nessun nuovo cliente questa settimana</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valutazione Media</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Basato su 0 recensioni</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ore Online (Settimana)</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.hoursThisWeek}h</div>
            <p className="text-xs text-muted-foreground">Dati di disponibilità</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Panoramica</TabsTrigger>
          <TabsTrigger value="consultations">Consulenze Recenti</TabsTrigger>
          <TabsTrigger value="messages">Messaggi</TabsTrigger>
          <TabsTrigger value="stats">Statistiche</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Performance Guadagni</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <Overview />
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Attività Recenti</CardTitle>
                <CardDescription>Hai ricevuto 2 nuove richieste di chat.</CardDescription>
              </CardHeader>
              <CardContent>
                <RecentActivity />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="consultations" className="space-y-4">
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
                <Clock className="mr-2 h-5 w-5 text-blue-500" />
                Consulenze di Oggi
              </CardTitle>
              <CardDescription>Le tue consulenze esoteriche completate oggi</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  client: "Anna Bianchi",
                  topic: "Lettura Tarocchi Futuro",
                  duration: "18 min",
                  earnings: "€45.00",
                  rating: 5,
                  time: "14:30",
                  type: "tarocchi",
                },
                {
                  client: "Paolo Neri",
                  topic: "Oroscopo Settimanale",
                  duration: "12 min",
                  earnings: "€30.00",
                  rating: 4,
                  time: "13:15",
                  type: "astrologia",
                },
                {
                  client: "Sara Rosa",
                  topic: "Consulenza Numerologica",
                  duration: "25 min",
                  earnings: "€62.50",
                  rating: 5,
                  time: "11:45",
                  type: "numerologia",
                },
              ].map((consultation, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gradient-to-r hover:from-pink-50 hover:to-blue-50 transition-all duration-300"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-pink-100 to-blue-100">
                      <Star className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{consultation.client}</p>
                      <p className="text-sm text-muted-foreground">{consultation.topic}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className="text-xs border-pink-200 text-pink-600">
                          {consultation.type}
                        </Badge>
                        <p className="text-xs text-muted-foreground">
                          {consultation.time} - {consultation.duration}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600 text-lg">{consultation.earnings}</p>
                    <div className="flex items-center justify-end mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < consultation.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages" className="space-y-4">
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
                <MessageSquare className="mr-2 h-5 w-5 text-pink-500" />
                Messaggi Recenti
              </CardTitle>
              <CardDescription>Ultimi messaggi dai tuoi clienti</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  client: "Mario Rossi",
                  nickname: "@mario_mystic",
                  message: "Grazie mille per i consigli! Sei stata molto precisa.",
                  time: "30 min fa",
                  unread: true,
                },
                {
                  client: "Giulia Verdi",
                  nickname: "@giulia_stars",
                  message: "Vorrei prenotare un'altra consulenza per domani.",
                  time: "1 ora fa",
                  unread: true,
                },
                {
                  client: "Luca Ferrari",
                  nickname: "@luca_seeker",
                  message: "Ciao Luna, ho bisogno di una lettura dei tarocchi urgente.",
                  time: "2 ore fa",
                  unread: false,
                },
              ].map((msg, index) => (
                <div
                  key={index}
                  className={`flex items-start space-x-3 p-3 border rounded-lg hover:bg-gradient-to-r hover:from-pink-50 hover:to-blue-50 transition-all duration-300 ${
                    msg.unread ? "bg-gradient-to-r from-pink-25 to-blue-25 border-pink-200" : ""
                  }`}
                >
                  <Avatar className="w-10 h-10 ring-2 ring-pink-200">
                    <AvatarFallback className="bg-gradient-to-r from-pink-200 to-blue-200">
                      {msg.client
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-gray-900 truncate">{msg.client}</p>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">{msg.time}</span>
                        {msg.unread && <div className="w-2 h-2 bg-pink-500 rounded-full"></div>}
                      </div>
                    </div>
                    <p className="text-xs text-pink-600 mb-1">{msg.nickname}</p>
                    <p className="text-sm text-gray-600">{msg.message}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle className="bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
                  Statistiche Settimanali
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm">Consulenze completate</span>
                  <span className="font-medium">47</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Tempo totale online</span>
                  <span className="font-medium">32h 15m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Guadagni lordi</span>
                  <span className="font-medium text-green-600">€1,782.50</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Commissione piattaforma (30%)</span>
                  <span className="font-medium text-red-600">-€534.75</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-medium">Guadagni netti</span>
                  <span className="font-bold text-green-600">€1,247.75</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle className="bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm">Rating medio</span>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="ml-1 font-medium">4.9</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Recensioni totali</span>
                  <span className="font-medium">256</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Clienti ricorrenti</span>
                  <span className="font-medium">68%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Tempo medio consulenza</span>
                  <span className="font-medium">18.5 min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Posizione in classifica</span>
                  <span className="font-medium text-blue-600">#3</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
