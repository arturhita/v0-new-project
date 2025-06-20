"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageSquare, Clock, CheckCircle, X, AlertTriangle, Users, TrendingUp } from "lucide-react"
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

export default function ChatRequestsPage() {
  const [requests, setRequests] = useState<ChatRequest[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Carica le richieste dal localStorage
  const loadRequests = () => {
    const savedRequests = JSON.parse(localStorage.getItem("chatRequests") || "[]")
    const parsedRequests = savedRequests.map((req: any) => ({
      ...req,
      createdAt: new Date(req.createdAt),
    }))
    setRequests(parsedRequests)
  }

  // Aggiorna le richieste ogni 2 secondi
  useEffect(() => {
    loadRequests()
    const interval = setInterval(loadRequests, 2000)
    return () => clearInterval(interval)
  }, [])

  const handleRequest = async (requestId: string, action: "accepted" | "rejected") => {
    setIsLoading(true)

    try {
      // Simula elaborazione
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Aggiorna lo stato della richiesta
      const updatedRequests = requests.map((req) => (req.id === requestId ? { ...req, status: action } : req))

      // Salva nel localStorage
      localStorage.setItem("chatRequests", JSON.stringify(updatedRequests))

      // Aggiorna lo stato locale
      setRequests(updatedRequests)

      const request = requests.find((req) => req.id === requestId)
      if (request) {
        toast({
          title: action === "accepted" ? "Richiesta accettata" : "Richiesta rifiutata",
          description: `Richiesta di ${request.userName} ${action === "accepted" ? "accettata" : "rifiutata"}.`,
          variant: action === "accepted" ? "default" : "destructive",
        })
      }
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

  const clearAllRequests = () => {
    localStorage.removeItem("chatRequests")
    setRequests([])
    toast({
      title: "Richieste cancellate",
      description: "Tutte le richieste sono state rimosse.",
    })
  }

  const pendingRequests = requests.filter((req) => req.status === "pending")
  const processedRequests = requests.filter((req) => req.status !== "pending")

  const getTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Ora"
    if (diffInMinutes < 60) return `${diffInMinutes} min fa`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} ore fa`
    return `${Math.floor(diffInMinutes / 1440)} giorni fa`
  }

  return (
    <div className="space-y-6 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 min-h-screen p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
            Richieste Chat
          </h2>
          <p className="text-muted-foreground">Gestisci le richieste di chat dai tuoi clienti</p>
        </div>
        <div className="flex items-center space-x-4">
          {pendingRequests.length > 0 && (
            <Badge className="bg-pink-500 text-white text-lg px-3 py-1 animate-pulse">
              {pendingRequests.length} in attesa
            </Badge>
          )}
          <Button onClick={clearAllRequests} variant="outline" size="sm">
            Pulisci Tutto
          </Button>
        </div>
      </div>

      {/* Statistiche */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="border-0 bg-gradient-to-r from-pink-500 to-rose-500 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-pink-100">Richieste in Attesa</p>
                <p className="text-3xl font-bold">{pendingRequests.length}</p>
              </div>
              <Clock className="h-8 w-8 text-pink-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-r from-green-500 to-emerald-500 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Accettate Oggi</p>
                <p className="text-3xl font-bold">
                  {processedRequests.filter((req) => req.status === "accepted").length}
                </p>
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
              <TrendingUp className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Richieste in Attesa */}
      {pendingRequests.length > 0 && (
        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-pink-600">
              <Clock className="mr-2 h-5 w-5 animate-pulse" />
              Richieste in Attesa ({pendingRequests.length})
            </CardTitle>
            <CardDescription>Nuove richieste di chat che richiedono la tua attenzione</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingRequests.map((request) => (
              <div
                key={request.id}
                className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200 animate-pulse"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-12 h-12 ring-2 ring-yellow-300">
                      <AvatarImage src={request.userAvatar || "/placeholder.svg"} alt={request.userName} />
                      <AvatarFallback className="bg-gradient-to-r from-yellow-200 to-orange-200">
                        {request.userName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold text-gray-900">{request.userName}</h4>
                      <p className="text-sm text-gray-600">{request.message}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className="bg-green-100 text-green-800">€{request.price}/min</Badge>
                        <span className="text-xs text-gray-500">{getTimeAgo(request.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleRequest(request.id, "accepted")}
                      disabled={isLoading}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Accetta
                    </Button>
                    <Button
                      onClick={() => handleRequest(request.id, "rejected")}
                      disabled={isLoading}
                      variant="destructive"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Rifiuta
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Richieste Elaborate */}
      {processedRequests.length > 0 && (
        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-600">
              <Users className="mr-2 h-5 w-5" />
              Richieste Elaborate ({processedRequests.length})
            </CardTitle>
            <CardDescription>Cronologia delle richieste accettate e rifiutate</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {processedRequests
              .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
              .map((request) => (
                <div
                  key={request.id}
                  className={`p-4 rounded-lg border ${
                    request.status === "accepted"
                      ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
                      : "bg-gradient-to-r from-red-50 to-pink-50 border-red-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={request.userAvatar || "/placeholder.svg"} alt={request.userName} />
                        <AvatarFallback
                          className={
                            request.status === "accepted"
                              ? "bg-gradient-to-r from-green-200 to-emerald-200"
                              : "bg-gradient-to-r from-red-200 to-pink-200"
                          }
                        >
                          {request.userName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium text-gray-900">{request.userName}</h4>
                        <p className="text-sm text-gray-600">{request.message}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className="bg-gray-100 text-gray-800">€{request.price}/min</Badge>
                          <span className="text-xs text-gray-500">{getTimeAgo(request.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <Badge
                      className={request.status === "accepted" ? "bg-green-500 text-white" : "bg-red-500 text-white"}
                    >
                      {request.status === "accepted" ? (
                        <>
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Accettata
                        </>
                      ) : (
                        <>
                          <X className="mr-1 h-3 w-3" />
                          Rifiutata
                        </>
                      )}
                    </Badge>
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      )}

      {/* Stato Vuoto */}
      {requests.length === 0 && (
        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardContent className="text-center py-12">
            <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Nessuna Richiesta</h3>
            <p className="text-gray-600">Non ci sono richieste di chat al momento.</p>
          </CardContent>
        </Card>
      )}

      {/* Info Box */}
      <Card className="border-0 bg-gradient-to-r from-blue-50 to-purple-50 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">Gestione Richieste Chat</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Le richieste si aggiornano automaticamente ogni 2 secondi</li>
                <li>• Accetta le richieste per iniziare la chat al minuto</li>
                <li>• Il timer e la scalatura crediti iniziano dopo l'accettazione</li>
                <li>• Rifiuta le richieste se non sei disponibile</li>
                <li>• Le richieste in attesa sono evidenziate con animazione</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
