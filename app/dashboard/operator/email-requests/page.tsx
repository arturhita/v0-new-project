"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, Clock, CheckCircle, AlertCircle, Send, X, Calendar, Euro } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface EmailRequest {
  id: number
  operatorId: string
  operatorName: string
  userId: string
  userName: string
  subject: string
  message: string
  price: number
  status: "pending" | "answered" | "rejected" | "expired"
  createdAt: Date
  responseDeadline: Date
  response?: {
    message: string
    respondedAt: Date
  }
}

export default function OperatorEmailRequestsPage() {
  const [requests, setRequests] = useState<EmailRequest[]>([])
  const [selectedTab, setSelectedTab] = useState("pending")
  const [responseText, setResponseText] = useState("")
  const [respondingTo, setRespondingTo] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Carica le richieste dal localStorage (filtrate per questo operatore)
    const savedConsultations = JSON.parse(localStorage.getItem("emailConsultations") || "[]")
    const operatorRequests = savedConsultations
      .filter((c: any) => c.operatorId === "1") // Simula l'ID dell'operatore corrente
      .map((c: any) => ({
        ...c,
        userId: `user_${c.id}`,
        userName: `Cliente ${c.id}`,
        createdAt: new Date(c.createdAt),
        responseDeadline: new Date(c.responseDeadline),
        response: c.response
          ? {
              ...c.response,
              respondedAt: new Date(c.response.respondedAt),
            }
          : undefined,
      }))
    setRequests(operatorRequests)
  }, [])

  const getTimeRemaining = (deadline: Date) => {
    const now = new Date()
    const diff = deadline.getTime() - now.getTime()

    if (diff <= 0) return "Scaduta"

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 0) {
      return `${hours}h ${minutes}m rimanenti`
    }
    return `${minutes}m rimanenti`
  }

  const getStatusBadge = (status: string, deadline: Date) => {
    const isExpired = new Date() > deadline

    if (status === "answered") {
      return <Badge className="bg-green-500">Risposta inviata</Badge>
    }
    if (status === "rejected") {
      return <Badge variant="destructive">Rifiutata</Badge>
    }
    if (status === "expired" || isExpired) {
      return <Badge variant="secondary">Scaduta</Badge>
    }
    return <Badge className="bg-blue-500">In attesa</Badge>
  }

  const handleResponse = async (requestId: number, action: "answer" | "reject") => {
    if (action === "answer" && !responseText.trim()) {
      toast({
        title: "Errore",
        description: "Inserisci una risposta prima di inviare.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const updatedRequests = requests.map((request) => {
        if (request.id === requestId) {
          return {
            ...request,
            status: action === "answer" ? "answered" : ("rejected" as const),
            response:
              action === "answer"
                ? {
                    message: responseText,
                    respondedAt: new Date(),
                  }
                : undefined,
          }
        }
        return request
      })

      setRequests(updatedRequests)

      // Aggiorna anche il localStorage
      const allConsultations = JSON.parse(localStorage.getItem("emailConsultations") || "[]")
      const updatedConsultations = allConsultations.map((c: any) => {
        if (c.id === requestId) {
          return {
            ...c,
            status: action === "answer" ? "answered" : "rejected",
            response:
              action === "answer"
                ? {
                    message: responseText,
                    respondedAt: new Date().toISOString(),
                  }
                : undefined,
          }
        }
        return c
      })
      localStorage.setItem("emailConsultations", JSON.stringify(updatedConsultations))

      setResponseText("")
      setRespondingTo(null)

      toast({
        title: action === "answer" ? "Risposta inviata" : "Richiesta rifiutata",
        description:
          action === "answer"
            ? "La tua risposta è stata inviata al cliente."
            : "La richiesta è stata rifiutata e i crediti sono stati rimborsati.",
      })
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore. Riprova.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const pendingRequests = requests.filter((r) => r.status === "pending" && new Date() <= r.responseDeadline)
  const answeredRequests = requests.filter((r) => r.status === "answered")
  const rejectedRequests = requests.filter((r) => r.status === "rejected")
  const expiredRequests = requests.filter((r) => r.status === "expired" || new Date() > r.responseDeadline)

  const totalEarnings = answeredRequests.reduce((sum, r) => sum + r.price, 0)

  return (
    <div className="space-y-6 bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 min-h-screen p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Richieste Email
          </h2>
          <p className="text-muted-foreground">Gestisci le domande dei tuoi clienti</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-green-600">€{totalEarnings.toFixed(2)}</div>
          <div className="text-sm text-gray-500">Guadagni totali</div>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending" className="relative">
            In Attesa ({pendingRequests.length})
            {pendingRequests.length > 0 && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
            )}
          </TabsTrigger>
          <TabsTrigger value="answered">Risposte ({answeredRequests.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rifiutate ({rejectedRequests.length})</TabsTrigger>
          <TabsTrigger value="expired">Scadute ({expiredRequests.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingRequests.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Mail className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Nessuna richiesta in attesa</h3>
                <p className="text-gray-600">Le nuove domande dei clienti appariranno qui</p>
              </CardContent>
            </Card>
          ) : (
            pendingRequests.map((request) => (
              <Card key={request.id} className="border-blue-200 bg-blue-50/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-blue-200">
                          {request.userName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{request.subject}</CardTitle>
                        <CardDescription>da {request.userName}</CardDescription>
                      </div>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(request.status, request.responseDeadline)}
                      <div className="text-sm text-gray-600 mt-1">
                        <Euro className="h-3 w-3 inline mr-1" />€{request.price}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-white p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Domanda del cliente:</h4>
                    <p className="text-gray-700">{request.message}</p>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>Ricevuta: {request.createdAt.toLocaleDateString("it-IT")}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span className="font-medium text-orange-600">
                          {getTimeRemaining(request.responseDeadline)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {respondingTo === request.id ? (
                    <div className="space-y-3 bg-white p-4 rounded-lg border">
                      <h4 className="font-medium">La tua risposta:</h4>
                      <Textarea
                        value={responseText}
                        onChange={(e) => setResponseText(e.target.value)}
                        placeholder="Scrivi qui la tua risposta dettagliata..."
                        rows={4}
                        maxLength={2000}
                      />
                      <div className="text-xs text-gray-500">{responseText.length}/2000 caratteri</div>

                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleResponse(request.id, "answer")}
                          disabled={!responseText.trim() || isSubmitting}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {isSubmitting ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          ) : (
                            <Send className="h-4 w-4 mr-2" />
                          )}
                          Invia Risposta
                        </Button>
                        <Button
                          onClick={() => handleResponse(request.id, "reject")}
                          disabled={isSubmitting}
                          variant="destructive"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Rifiuta
                        </Button>
                        <Button
                          onClick={() => {
                            setRespondingTo(null)
                            setResponseText("")
                          }}
                          variant="outline"
                          disabled={isSubmitting}
                        >
                          Annulla
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex space-x-2">
                      <Button onClick={() => setRespondingTo(request.id)} className="bg-blue-600 hover:bg-blue-700">
                        <Mail className="h-4 w-4 mr-2" />
                        Rispondi
                      </Button>
                      <Button onClick={() => handleResponse(request.id, "reject")} variant="destructive">
                        <X className="h-4 w-4 mr-2" />
                        Rifiuta
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="answered" className="space-y-4">
          {answeredRequests.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <CheckCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Nessuna risposta inviata</h3>
                <p className="text-gray-600">Le tue risposte appariranno qui</p>
              </CardContent>
            </Card>
          ) : (
            answeredRequests.map((request) => (
              <Card key={request.id} className="border-green-200 bg-green-50/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-green-200">
                          {request.userName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{request.subject}</CardTitle>
                        <CardDescription>per {request.userName}</CardDescription>
                      </div>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(request.status, request.responseDeadline)}
                      <div className="text-sm font-medium text-green-600 mt-1">+€{request.price}</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-white p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Domanda:</h4>
                    <p className="text-gray-700 text-sm">{request.message}</p>
                  </div>

                  {request.response && (
                    <div className="bg-green-100 p-4 rounded-lg border border-green-200">
                      <h4 className="font-medium mb-2 text-green-800">La tua risposta:</h4>
                      <p className="text-green-700">{request.response.message}</p>
                      <div className="mt-3 text-sm text-green-600">
                        Inviata: {request.response.respondedAt.toLocaleDateString("it-IT")} alle{" "}
                        {request.response.respondedAt.toLocaleTimeString("it-IT", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          {rejectedRequests.map((request) => (
            <Card key={request.id} className="border-red-200 bg-red-50/50 opacity-75">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-red-200">
                        {request.userName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{request.subject}</CardTitle>
                      <CardDescription>da {request.userName}</CardDescription>
                    </div>
                  </div>
                  {getStatusBadge(request.status, request.responseDeadline)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Domanda rifiutata:</h4>
                  <p className="text-gray-700">{request.message}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="expired" className="space-y-4">
          {expiredRequests.map((request) => (
            <Card key={request.id} className="border-gray-200 bg-gray-50/50 opacity-75">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-gray-200">
                        {request.userName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{request.subject}</CardTitle>
                      <CardDescription>da {request.userName}</CardDescription>
                    </div>
                  </div>
                  {getStatusBadge(request.status, request.responseDeadline)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert className="border-orange-200 bg-orange-100">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800">
                    Questa richiesta è scaduta. I crediti del cliente sono stati rimborsati automaticamente.
                  </AlertDescription>
                </Alert>

                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Domanda scaduta:</h4>
                  <p className="text-gray-700">{request.message}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
