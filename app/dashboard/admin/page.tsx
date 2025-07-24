"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { DollarSign, Users, Activity, CreditCard } from "lucide-react"
import { Overview } from "@/components/overview"
import { RecentConsultations } from "@/components/recent-consultations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Star, Settings, Percent, Edit, Trash2, CheckCircle, XCircle } from "lucide-react"

export default async function AdminDashboardPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch platform-wide stats
  const { count: userCount } = await supabase.from("profiles").select("*", { count: "exact" }).eq("role", "user")
  const { count: operatorCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact" })
    .eq("role", "operator")
  const { data: totalRevenue } = await supabase.rpc("get_total_revenue") // Assuming an RPC function
  const { count: activeConsultations } = await supabase
    .from("consultations")
    .select("*", { count: "exact" })
    .in("status", ["active", "scheduled"])

  const [operatorCommission, setOperatorCommission] = useState(70)
  const [platformCommission, setPlatformCommission] = useState(30)

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Dashboard Amministratore</h1>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entrate Totali</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{totalRevenue || "0.00"}</div>
            <p className="text-xs text-muted-foreground">+20.1% dal mese scorso</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utenti Attivi</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{userCount || 0}</div>
            <p className="text-xs text-muted-foreground">+180.1% dal mese scorso</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consulenti</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{operatorCount || 0}</div>
            <p className="text-xs text-muted-foreground">+19% dal mese scorso</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consulenze Attive</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{activeConsultations || 0}</div>
            <p className="text-xs text-muted-foreground">+201 dall'ultima ora</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Panoramica</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <Overview />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Consulenze Recenti</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentConsultations consultations={[]} />
          </CardContent>
        </Card>
      </div>

      {/* Admin Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Panoramica</TabsTrigger>
          <TabsTrigger value="users">Utenti</TabsTrigger>
          <TabsTrigger value="operators">Consulenti</TabsTrigger>
          <TabsTrigger value="payments">Pagamenti</TabsTrigger>
          <TabsTrigger value="reviews">Recensioni</TabsTrigger>
          <TabsTrigger value="settings">Impostazioni</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle className="bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
                  Statistiche Esoteriche
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Consulenze più richieste</p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Tarocchi Amore</span>
                        <span className="font-medium text-pink-600">45%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Oroscopi</span>
                        <span className="font-medium text-blue-600">28%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Cartomanzia</span>
                        <span className="font-medium text-purple-600">18%</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Metodi di consulenza</p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Telefono</span>
                        <span className="font-medium">65%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Chat</span>
                        <span className="font-medium">35%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle className="bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
                  Commissioni Attuali
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Consulenti</span>
                    <span className="font-bold text-green-600">{operatorCommission}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Piattaforma</span>
                    <span className="font-bold text-blue-600">{platformCommission}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-blue-500"
                      style={{ width: `${operatorCommission}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
                <Users className="mr-2 h-5 w-5 text-pink-500" />
                Gestione Utenti
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    name: "Mario Rossi",
                    email: "mario@example.com",
                    status: "attivo",
                    consultations: 23,
                    spent: "€456.50",
                    joined: "15/03/2024",
                  },
                  {
                    name: "Giulia Verdi",
                    email: "giulia@example.com",
                    status: "attivo",
                    consultations: 45,
                    spent: "€892.30",
                    joined: "08/02/2024",
                  },
                  {
                    name: "Luca Ferrari",
                    email: "luca@example.com",
                    status: "sospeso",
                    consultations: 12,
                    spent: "€234.80",
                    joined: "22/04/2024",
                  },
                ].map((user, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gradient-to-r hover:from-pink-50 hover:to-blue-50 transition-all duration-300"
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src="/placeholder.svg" alt={user.name} />
                        <AvatarFallback className="bg-gradient-to-r from-pink-200 to-blue-200">
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <p className="text-xs text-muted-foreground">Iscritto: {user.joined}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={user.status === "attivo" ? "default" : "destructive"} className="mb-2">
                        {user.status}
                      </Badge>
                      <p className="text-sm">{user.consultations} consulenze</p>
                      <p className="text-sm font-medium text-green-600">{user.spent}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 bg-transparent">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operators" className="space-y-4">
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
                <Users className="mr-2 h-5 w-5 text-blue-500" />
                Gestione Consulenti
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    name: "Luna Stellare",
                    specialty: "Cartomante & Tarocchi",
                    status: "approvato",
                    rating: 4.9,
                    consultations: 256,
                    earnings: "€3,240",
                    commission: 70,
                  },
                  {
                    name: "Maestro Cosmos",
                    specialty: "Astrologo",
                    status: "approvato",
                    rating: 4.8,
                    consultations: 189,
                    earnings: "€2,890",
                    commission: 70,
                  },
                  {
                    name: "Novice Mystic",
                    specialty: "Cartomante",
                    status: "in_attesa",
                    rating: 0,
                    consultations: 0,
                    earnings: "€0",
                    commission: 60,
                  },
                ].map((operator, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gradient-to-r hover:from-pink-50 hover:to-blue-50 transition-all duration-300"
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src="/placeholder.svg" alt={operator.name} />
                        <AvatarFallback className="bg-gradient-to-r from-pink-200 to-blue-200">
                          {operator.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{operator.name}</p>
                        <p className="text-sm text-muted-foreground">{operator.specialty}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          {operator.rating > 0 && (
                            <>
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs">{operator.rating}</span>
                            </>
                          )}
                          <span className="text-xs text-muted-foreground">Commissione: {operator.commission}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={
                          operator.status === "approvato"
                            ? "default"
                            : operator.status === "in_attesa"
                              ? "secondary"
                              : "destructive"
                        }
                        className="mb-2"
                      >
                        {operator.status}
                      </Badge>
                      <p className="text-sm">{operator.consultations} consulenze</p>
                      <p className="text-sm font-medium text-green-600">{operator.earnings}</p>
                    </div>
                    <div className="flex space-x-2">
                      {operator.status === "in_attesa" && (
                        <>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="destructive">
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
                <CreditCard className="mr-2 h-5 w-5 text-green-500" />
                Gestione Pagamenti
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    id: "PAY001",
                    operator: "Luna Stellare",
                    amount: "€234.50",
                    commission: "€70.35",
                    date: "15/12/2024",
                    status: "in_attesa",
                  },
                  {
                    id: "PAY002",
                    operator: "Maestro Cosmos",
                    amount: "€189.20",
                    commission: "€56.76",
                    date: "14/12/2024",
                    status: "approvato",
                  },
                  {
                    id: "PAY003",
                    operator: "Cristal Mystic",
                    amount: "€156.80",
                    commission: "€47.04",
                    date: "13/12/2024",
                    status: "pagato",
                  },
                ].map((payment, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gradient-to-r hover:from-pink-50 hover:to-blue-50 transition-all duration-300"
                  >
                    <div>
                      <p className="font-medium">{payment.id}</p>
                      <p className="text-sm text-muted-foreground">{payment.operator}</p>
                      <p className="text-xs text-muted-foreground">{payment.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">{payment.amount}</p>
                      <p className="text-sm text-muted-foreground">Commissione: {payment.commission}</p>
                      <Badge
                        variant={
                          payment.status === "pagato"
                            ? "default"
                            : payment.status === "approvato"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {payment.status}
                      </Badge>
                    </div>
                    <div className="flex space-x-2">
                      {payment.status === "in_attesa" && (
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          Approva
                        </Button>
                      )}
                      {payment.status === "approvato" && (
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                          Paga
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4">
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
                <Star className="mr-2 h-5 w-5 text-yellow-500" />
                Moderazione Recensioni
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    id: "REV001",
                    user: "Mario Rossi",
                    operator: "Luna Stellare",
                    rating: 5,
                    comment: "Lettura incredibile! Ha previsto tutto perfettamente. Consigliatissima!",
                    date: "15/12/2024",
                    status: "approvata",
                  },
                  {
                    id: "REV002",
                    user: "Giulia Verdi",
                    operator: "Maestro Cosmos",
                    rating: 1,
                    comment: "Truffa totale! Non ha indovinato niente e mi ha fatto perdere tempo e soldi!",
                    date: "14/12/2024",
                    status: "segnalata",
                  },
                  {
                    id: "REV003",
                    user: "Anna Bianchi",
                    operator: "Cristal Mystic",
                    rating: 4,
                    comment: "Brava sensitiva, mi ha aiutato molto con i miei problemi sentimentali.",
                    date: "13/12/2024",
                    status: "in_attesa",
                  },
                ].map((review, index) => (
                  <div
                    key={index}
                    className="flex items-start justify-between p-4 border rounded-lg hover:bg-gradient-to-r hover:from-pink-50 hover:to-blue-50 transition-all duration-300"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <p className="font-medium">{review.user}</p>
                        <span className="text-sm text-muted-foreground">→</span>
                        <p className="text-sm text-muted-foreground">{review.operator}</p>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm mb-2">{review.comment}</p>
                      <p className="text-xs text-muted-foreground">{review.date}</p>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <Badge
                        variant={
                          review.status === "approvata"
                            ? "default"
                            : review.status === "segnalata"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {review.status}
                      </Badge>
                      <div className="flex space-x-2">
                        {review.status === "in_attesa" && (
                          <>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {review.status === "segnalata" && (
                          <Button size="sm" variant="destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
                  <Percent className="mr-2 h-5 w-5 text-green-500" />
                  Impostazioni Commissioni
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="operator-commission">Commissione Consulenti (%)</Label>
                  <Input
                    id="operator-commission"
                    type="number"
                    value={operatorCommission}
                    onChange={(e) => {
                      const value = Number.parseInt(e.target.value)
                      setOperatorCommission(value)
                      setPlatformCommission(100 - value)
                    }}
                    min="50"
                    max="90"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="platform-commission">Commissione Piattaforma (%)</Label>
                  <Input
                    id="platform-commission"
                    type="number"
                    value={platformCommission}
                    onChange={(e) => {
                      const value = Number.parseInt(e.target.value)
                      setPlatformCommission(value)
                      setOperatorCommission(100 - value)
                    }}
                    min="10"
                    max="50"
                  />
                </div>
                <Button className="w-full bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600">
                  Salva Commissioni
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
                  <Settings className="mr-2 h-5 w-5 text-blue-500" />
                  Impostazioni Piattaforma
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-approve">Approvazione automatica consulenti</Label>
                  <Switch id="auto-approve" />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-review">Approvazione automatica recensioni</Label>
                  <Switch id="auto-review" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="min-rate">Tariffa minima (€/min)</Label>
                  <Input id="min-rate" type="number" defaultValue="1.50" step="0.10" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-rate">Tariffa massima (€/min)</Label>
                  <Input id="max-rate" type="number" defaultValue="10.00" step="0.10" />
                </div>
                <Button className="w-full bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600">
                  Salva Impostazioni
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
