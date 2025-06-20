"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mail, Clock, CheckCircle, AlertCircle, Star, Calendar } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface EmailConsultation {
  id: number
  operatorId: string
  operatorName: string
  subject: string
  message: string
  price: number
  status: "pending" | "answered" | "expired"
  createdAt: Date
  responseDeadline: Date
  response?: {
    message: string
    respondedAt: Date
    rating?: number
  }
}

export default function UserEmailConsultationsPage() {
  const [consultations, setConsultations] = useState<EmailConsultation[]>([])
  const [selectedTab, setSelectedTab] = useState("pending")

  useEffect(() => {
    // Carica le consulenze dal localStorage
    const savedConsultations = JSON.parse(localStorage.getItem("emailConsultations") || "[]")
    const parsedConsultations = savedConsultations.map((c: any) => ({
      ...c,
      createdAt: new Date(c.createdAt),
      responseDeadline: new Date(c.responseDeadline),
      response: c.response
        ? {
            ...c.response,
            respondedAt: new Date(c.response.respondedAt),
          }
        : undefined,
    }))
    setConsultations(parsedConsultations)
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
      return <Badge className="bg-green-500">Risposta ricevuta</Badge>
    }
    if (status === "expired" || isExpired) {
      return <Badge variant="destructive">Scaduta</Badge>
    }
    return <Badge className="bg-blue-500">In attesa</Badge>
  }

  const pendingConsultations = consultations.filter((c) => c.status === "pending" && new Date() <= c.responseDeadline)
  const answeredConsultations = consultations.filter((c) => c.status === "answered")
  const expiredConsultations = consultations.filter((c) => c.status === "expired" || new Date() > c.responseDeadline)

  return (
    <div className="space-y-6 bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 min-h-screen p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Consulenze via Email
          </h2>
          <p className="text-muted-foreground">Gestisci le tue domande e risposte</p>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="relative">
            In Attesa ({pendingConsultations.length})
            {pendingConsultations.length > 0 && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
            )}
          </TabsTrigger>
          <TabsTrigger value="answered" className="relative">
            Risposte ({answeredConsultations.length})
            {answeredConsultations.some((c) => !c.response?.rating) && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></div>
            )}
          </TabsTrigger>
          <TabsTrigger value="expired">Scadute ({expiredConsultations.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingConsultations.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Mail className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Nessuna consulenza in attesa</h3>
                <p className="text-gray-600">Le tue domande via email appariranno qui</p>
              </CardContent>
            </Card>
          ) : (
            pendingConsultations.map((consultation) => (
              <Card key={consultation.id} className="border-blue-200 bg-blue-50/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-blue-200">
                          {consultation.operatorName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{consultation.subject}</CardTitle>
                        <CardDescription>per {consultation.operatorName}</CardDescription>
                      </div>
                    </div>
                    {getStatusBadge(consultation.status, consultation.responseDeadline)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-white p-4 rounded-lg">
                    <h4 className="font-medium mb-2">La tua domanda:</h4>
                    <p className="text-gray-700">{consultation.message}</p>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>Inviata: {consultation.createdAt.toLocaleDateString("it-IT")}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{getTimeRemaining(consultation.responseDeadline)}</span>
                      </div>
                    </div>
                    <span className="font-medium text-purple-600">€{consultation.price}</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="answered" className="space-y-4">
          {answeredConsultations.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <CheckCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Nessuna risposta ricevuta</h3>
                <p className="text-gray-600">Le risposte dei consulenti appariranno qui</p>
              </CardContent>
            </Card>
          ) : (
            answeredConsultations.map((consultation) => (
              <Card key={consultation.id} className="border-green-200 bg-green-50/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-green-200">
                          {consultation.operatorName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{consultation.subject}</CardTitle>
                        <CardDescription>da {consultation.operatorName}</CardDescription>
                      </div>
                    </div>
                    {getStatusBadge(consultation.status, consultation.responseDeadline)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-white p-4 rounded-lg">
                    <h4 className="font-medium mb-2">La tua domanda:</h4>
                    <p className="text-gray-700 text-sm">{consultation.message}</p>
                  </div>

                  {consultation.response && (
                    <div className="bg-green-100 p-4 rounded-lg border border-green-200">
                      <h4 className="font-medium mb-2 text-green-800">Risposta di {consultation.operatorName}:</h4>
                      <p className="text-green-700">{consultation.response.message}</p>
                      <div className="mt-3 text-sm text-green-600">
                        Risposta ricevuta: {consultation.response.respondedAt.toLocaleDateString("it-IT")} alle{" "}
                        {consultation.response.respondedAt.toLocaleTimeString("it-IT", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>€{consultation.price}</span>
                      <span>•</span>
                      <span>Inviata: {consultation.createdAt.toLocaleDateString("it-IT")}</span>
                    </div>

                    {!consultation.response?.rating && (
                      <Button size="sm" className="bg-yellow-500 hover:bg-yellow-600">
                        <Star className="h-4 w-4 mr-1" />
                        Valuta Risposta
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="expired" className="space-y-4">
          {expiredConsultations.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Nessuna consulenza scaduta</h3>
                <p className="text-gray-600">Le consulenze non risposte entro 12 ore appariranno qui</p>
              </CardContent>
            </Card>
          ) : (
            expiredConsultations.map((consultation) => (
              <Card key={consultation.id} className="border-red-200 bg-red-50/50 opacity-75">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-red-200">
                          {consultation.operatorName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{consultation.subject}</CardTitle>
                        <CardDescription>per {consultation.operatorName}</CardDescription>
                      </div>
                    </div>
                    {getStatusBadge(consultation.status, consultation.responseDeadline)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert className="border-red-200 bg-red-100">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      Questa consulenza è scaduta. I tuoi crediti sono stati rimborsati automaticamente.
                    </AlertDescription>
                  </Alert>

                  <div className="bg-white p-4 rounded-lg">
                    <h4 className="font-medium mb-2">La tua domanda:</h4>
                    <p className="text-gray-700">{consultation.message}</p>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Scaduta: {consultation.responseDeadline.toLocaleDateString("it-IT")}</span>
                    <span className="font-medium text-red-600">€{consultation.price} rimborsato</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
