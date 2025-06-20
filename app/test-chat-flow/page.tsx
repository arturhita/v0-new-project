"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChatSystem } from "@/components/chat-system"
import {
  MessageSquare,
  Clock,
  CheckCircle,
  X,
  Phone,
  AlertCircle,
  Users,
  Timer,
  Play,
  User,
  UserCheck,
  CreditCard,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ChatRequest {
  id: string
  operatorId: string
  operatorName: string
  userName: string
  userAvatar: string
  price: number
  status: "pending" | "accepted" | "rejected"
  createdAt: Date
  message: string
}

export default function TestChatFlowPage() {
  const [showUserChat, setShowUserChat] = useState(false)
  const [requests, setRequests] = useState<ChatRequest[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [userCredits, setUserCredits] = useState(50.0)
  const { toast } = useToast()

  // Operatore di test
  const testOperator = {
    id: "1",
    name: "Luna Stellare",
    avatar: "/placeholder.svg?height=80&width=80",
    specialty: "Cartomante & Tarocchi",
    price: 2.5,
    status: "online",
    rating: 4.9,
  }

  // Carica le richieste dal localStorage
  useEffect(() => {
    const loadRequests = () => {
      const storedRequests = JSON.parse(localStorage.getItem("chatRequests") || "[]")
      const formattedRequests = storedRequests.map((req: any) => ({
        ...req,
        createdAt: new Date(req.createdAt),
      }))
      setRequests(formattedRequests)
    }

    loadRequests()

    // Aggiorna ogni 2 secondi per il test
    const interval = setInterval(loadRequests, 2000)
    return () => clearInterval(interval)
  }, [])

  const handleRequest = async (requestId: string, action: "accept" | "reject") => {
    setIsLoading(true)

    try {
      // Simula elaborazione
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Aggiorna lo stato della richiesta
      const updatedRequests = requests.map((req) =>
        req.id === requestId
          ? { ...req, status: action === "accept" ? ("accepted" as const) : ("rejected" as const) }
          : req,
      )

      setRequests(updatedRequests)

      // Salva nel localStorage
      const storedRequests = JSON.parse(localStorage.getItem("chatRequests") || "[]")
      const updatedStoredRequests = storedRequests.map((req: any) =>
        req.id === requestId ? { ...req, status: action === "accept" ? "accepted" : "rejected" } : req,
      )
      localStorage.setItem("chatRequests", JSON.stringify(updatedStoredRequests))

      const request = requests.find((r) => r.id === requestId)

      toast({
        title: action === "accept" ? "✅ Richiesta accettata" : "❌ Richiesta rifiutata",
        description:
          action === "accept"
            ? `Hai accettato la richiesta di chat di ${request?.userName}. La sessione inizierà automaticamente.`
            : `Hai rifiutato la richiesta di chat di ${request?.userName}.`,
      })
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore nell'elaborazione della richiesta.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Ora"
    if (diffInMinutes < 60) return `${diffInMinutes} min fa`

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours} ore fa`

    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays} giorni fa`
  }

  const clearAllRequests = () => {
    localStorage.removeItem("chatRequests")
    setRequests([])
    toast({
      title: "🗑️ Richieste cancellate",
      description: "Tutte le richieste di test sono state rimosse.",
    })
  }

  const pendingRequests = requests.filter((req) => req.status === "pending")
  const processedRequests = requests.filter((req) => req.status !== "pending")

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
            🧪 Test Flusso Chat
          </h1>
          <p className="text-lg text-gray-600">Testa il nuovo sistema di richieste chat tra utente e operatore</p>
          <div className="flex justify-center space-x-4">
            <Button
              onClick={() => setShowUserChat(true)}
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
            >
              <User className="mr-2 h-4 w-4" />
              Apri Chat Utente
            </Button>
            <Button onClick={clearAllRequests} variant="outline">
              🗑️ Pulisci Test
            </Button>
          </div>
        </div>

        {/* Istruzioni */}
        <Card className="border-0 bg-gradient-to-r from-blue-50 to-purple-50 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <Play className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">🎯 Come Testare il Flusso</h3>
                <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
                  <li>
                    <strong>Passo 1:</strong> Clicca "Apri Chat Utente" per simulare un utente
                  </li>
                  <li>
                    <strong>Passo 2:</strong> Nella chat, clicca "Richiedi Chat" per inviare una richiesta
                  </li>
                  <li>
                    <strong>Passo 3:</strong> Torna qui e vai nella tab "Dashboard Operatore"
                  </li>
                  <li>
                    <strong>Passo 4:</strong> Vedrai la richiesta in attesa - clicca "Accetta" o "Rifiuta"
                  </li>
                  <li>
                    <strong>Passo 5:</strong> Se accetti, la chat inizierà automaticamente per l'utente
                  </li>
                  <li>
                    <strong>Passo 6:</strong> Il timer e la scalatura crediti partiranno automaticamente
                  </li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs per Utente e Operatore */}
        <Tabs defaultValue="operator" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="operator" className="flex items-center">
              <UserCheck className="mr-2 h-4 w-4" />
              Dashboard Operatore
              {pendingRequests.length > 0 && (
                <Badge className="ml-2 bg-orange-500 text-white text-xs px-2 py-0">{pendingRequests.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center">
              <AlertCircle className="mr-2 h-4 w-4" />
              Statistiche Test
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Operatore */}
          <TabsContent value="operator" className="space-y-6">
            {/* Statistiche Operatore */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-0 bg-gradient-to-r from-orange-500 to-red-500 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100">Richieste in Attesa</p>
                      <p className="text-3xl font-bold">{pendingRequests.length}</p>
                    </div>
                    <Clock className="h-8 w-8 text-orange-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100">Richieste Accettate</p>
                      <p className="text-3xl font-bold">{requests.filter((r) => r.status === "accepted").length}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100">Totale Richieste</p>
                      <p className="text-3xl font-bold">{requests.length}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-200" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Richieste in Attesa */}
            {pendingRequests.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <h3 className="text-xl font-semibold text-gray-900">🔔 Richieste in Attesa</h3>
                  <Badge className="bg-orange-500 text-white animate-pulse">{pendingRequests.length} nuove</Badge>
                </div>
                <div className="grid gap-4">
                  {pendingRequests.map((request) => (
                    <Card
                      key={request.id}
                      className="border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 ring-2 ring-orange-200 animate-pulse"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <Avatar className="w-12 h-12 ring-2 ring-orange-200">
                              <AvatarImage src={request.userAvatar || "/placeholder.svg"} alt={request.userName} />
                              <AvatarFallback className="bg-gradient-to-r from-orange-200 to-red-200">
                                {request.userName
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h4 className="font-semibold text-gray-900">{request.userName}</h4>
                                <Badge className="bg-orange-100 text-orange-800">€{request.price}/min</Badge>
                                <Badge variant="outline" className="text-orange-600 border-orange-300">
                                  <Timer className="w-3 h-3 mr-1" />
                                  {formatTimeAgo(request.createdAt)}
                                </Badge>
                              </div>
                              <p className="text-gray-600 mb-3">{request.message}</p>
                              <div className="flex items-center space-x-2 text-sm text-gray-500">
                                <Phone className="w-4 h-4" />
                                <span>Richiesta di consulenza al minuto</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              onClick={() => handleRequest(request.id, "accept")}
                              disabled={isLoading}
                              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Accetta
                            </Button>
                            <Button
                              onClick={() => handleRequest(request.id, "reject")}
                              disabled={isLoading}
                              variant="destructive"
                            >
                              <X className="w-4 h-4 mr-2" />
                              Rifiuta
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Richieste Elaborate */}
            {processedRequests.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900">📋 Richieste Elaborate</h3>
                <div className="grid gap-4">
                  {processedRequests.slice(0, 5).map((request) => (
                    <Card key={request.id} className="border-0 bg-white/60 backdrop-blur-sm shadow-md opacity-75">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={request.userAvatar || "/placeholder.svg"} alt={request.userName} />
                              <AvatarFallback className="bg-gray-200">
                                {request.userName
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-medium text-gray-700">{request.userName}</h4>
                              <p className="text-sm text-gray-500">{formatTimeAgo(request.createdAt)}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className="bg-gray-100 text-gray-800">€{request.price}/min</Badge>
                            <Badge
                              variant={request.status === "accepted" ? "default" : "destructive"}
                              className={request.status === "accepted" ? "bg-green-500" : ""}
                            >
                              {request.status === "accepted" ? "✅ Accettata" : "❌ Rifiutata"}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Stato Vuoto */}
            {requests.length === 0 && (
              <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
                <CardContent className="p-12 text-center">
                  <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Nessuna richiesta di test</h3>
                  <p className="text-gray-600 mb-4">
                    Clicca "Apri Chat Utente" per iniziare a testare il flusso delle richieste.
                  </p>
                  <Button
                    onClick={() => setShowUserChat(true)}
                    className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Inizia Test
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Statistiche Test */}
          <TabsContent value="stats" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="mr-2 h-5 w-5 text-blue-500" />
                    Dati Operatore Test
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-12 h-12 ring-2 ring-pink-200">
                      <AvatarImage src={testOperator.avatar || "/placeholder.svg"} alt={testOperator.name} />
                      <AvatarFallback className="bg-gradient-to-r from-pink-200 to-purple-200">LS</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold">{testOperator.name}</h4>
                      <p className="text-sm text-gray-600">{testOperator.specialty}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Tariffa:</span>
                      <span className="font-semibold ml-2">€{testOperator.price}/min</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Status:</span>
                      <Badge className="ml-2 bg-green-500">{testOperator.status}</Badge>
                    </div>
                    <div>
                      <span className="text-gray-500">Rating:</span>
                      <span className="font-semibold ml-2">⭐ {testOperator.rating}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">ID:</span>
                      <span className="font-mono text-xs ml-2">{testOperator.id}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="mr-2 h-5 w-5 text-green-500" />
                    Dati Utente Test
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">€{userCredits.toFixed(2)}</div>
                    <div className="text-sm text-gray-500">Crediti disponibili</div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Nome:</span>
                      <span className="font-semibold">Utente Test</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Tipo:</span>
                      <span className="font-semibold">Cliente</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Sessioni:</span>
                      <span className="font-semibold">{requests.filter((r) => r.status === "accepted").length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Cronologia Test */}
            <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="mr-2 h-5 w-5 text-purple-500" />
                  Cronologia Test
                </CardTitle>
              </CardHeader>
              <CardContent>
                {requests.length > 0 ? (
                  <div className="space-y-3">
                    {requests
                      .slice()
                      .reverse()
                      .map((request, index) => (
                        <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {requests.length - index}
                            </div>
                            <div>
                              <p className="font-medium">{request.userName}</p>
                              <p className="text-sm text-gray-500">{formatTimeAgo(request.createdAt)}</p>
                            </div>
                          </div>
                          <Badge
                            variant={
                              request.status === "accepted"
                                ? "default"
                                : request.status === "rejected"
                                  ? "destructive"
                                  : "secondary"
                            }
                            className={
                              request.status === "accepted"
                                ? "bg-green-500"
                                : request.status === "pending"
                                  ? "bg-yellow-500"
                                  : ""
                            }
                          >
                            {request.status === "accepted"
                              ? "✅ Accettata"
                              : request.status === "rejected"
                                ? "❌ Rifiutata"
                                : "⏳ In attesa"}
                          </Badge>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">Nessuna attività di test ancora</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Chat System Modal */}
      {showUserChat && (
        <ChatSystem
          operatorId={testOperator.id}
          operatorName={testOperator.name}
          operatorAvatar={testOperator.avatar}
          operatorPrice={testOperator.price}
          operatorStatus={testOperator.status}
          userCredits={userCredits}
          onClose={() => setShowUserChat(false)}
        />
      )}
    </div>
  )
}
