"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, Send, AlertCircle, Ban, Info, Clock, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"

// Dati delle conversazioni dal punto di vista dell'utente
const conversations = [
  {
    id: 1,
    operatorId: 1,
    operatorName: "Luna Stellare",
    operatorAvatar: "/placeholder.svg?height=40&width=40",
    operatorSpecialty: "Cartomante & Tarocchi",
    lastMessage: "Grazie per aver scelto la mia consulenza! Come posso aiutarti?",
    lastMessageTime: "2 ore fa",
    unreadCount: 1,
    messageCount: 2,
    maxMessages: 5,
    status: "active", // active, completed, reopened
    canMessage: true,
    lastConsultationDate: null,
    messages: [
      {
        id: 1,
        text: "Ciao Luna! Ho visto il tuo profilo e vorrei sapere se puoi aiutarmi con una questione d'amore.",
        sender: "user",
        timestamp: new Date(Date.now() - 3600000 * 3),
        isRead: true,
      },
      {
        id: 2,
        text: "Grazie per aver scelto la mia consulenza! Come posso aiutarti?",
        sender: "operator",
        timestamp: new Date(Date.now() - 3600000 * 2),
        isRead: false,
      },
    ],
  },
  {
    id: 2,
    operatorId: 2,
    operatorName: "Stella Mistica",
    operatorAvatar: "/placeholder.svg?height=40&width=40",
    operatorSpecialty: "Astrologia & Oroscopi",
    lastMessage: "Hai raggiunto il limite di 5 messaggi. Prenota una consulenza per continuare.",
    lastMessageTime: "1 giorno fa",
    unreadCount: 0,
    messageCount: 5,
    maxMessages: 5,
    status: "completed",
    canMessage: false,
    lastConsultationDate: null,
    messages: [
      {
        id: 1,
        text: "Ciao, vorrei un oroscopo personalizzato per questo mese.",
        sender: "user",
        timestamp: new Date(Date.now() - 86400000 * 2),
        isRead: true,
      },
      {
        id: 2,
        text: "Perfetto! Dimmi la tua data di nascita completa.",
        sender: "operator",
        timestamp: new Date(Date.now() - 86400000 * 2 + 1800000),
        isRead: true,
      },
      {
        id: 3,
        text: "15 marzo 1990, ore 14:30, Milano.",
        sender: "user",
        timestamp: new Date(Date.now() - 86400000 * 2 + 3600000),
        isRead: true,
      },
      {
        id: 4,
        text: "Grazie! Vedo una forte influenza di Marte nel tuo tema natale.",
        sender: "operator",
        timestamp: new Date(Date.now() - 86400000 * 1.5),
        isRead: true,
      },
      {
        id: 5,
        text: "Hai raggiunto il limite di 5 messaggi. Prenota una consulenza per continuare.",
        sender: "system",
        timestamp: new Date(Date.now() - 86400000),
        isRead: true,
      },
    ],
  },
  {
    id: 3,
    operatorId: 3,
    operatorName: "Marco Veggente",
    operatorAvatar: "/placeholder.svg?height=40&width=40",
    operatorSpecialty: "Sensitivo & Medianità",
    lastMessage: "Conversazione riaperta dopo la consulenza! Come ti senti?",
    lastMessageTime: "30 min fa",
    unreadCount: 2,
    messageCount: 1,
    maxMessages: 5,
    status: "reopened",
    canMessage: true,
    lastConsultationDate: new Date(Date.now() - 1800000),
    messages: [
      {
        id: 1,
        text: "Conversazione riaperta dopo la consulenza! Come ti senti?",
        sender: "operator",
        timestamp: new Date(Date.now() - 1800000),
        isRead: false,
      },
    ],
  },
]

export default function UserMessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [messageError, setMessageError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [selectedConversation])

  // Controllo per numeri di telefono
  const containsPhoneNumber = (text: string) => {
    const phonePatterns = [
      /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/, // 123-456-7890, 123.456.7890, 1234567890
      /\b\d{2,4}[-.\s]?\d{2,4}[-.\s]?\d{2,4}[-.\s]?\d{2,4}\b/, // Formati europei
      /\+\d{1,3}[-.\s]?\d{1,14}\b/, // Formato internazionale
      /\b\d{10,}\b/, // Sequenze lunghe di numeri
    ]
    return phonePatterns.some((pattern) => pattern.test(text))
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || isLoading) return

    const conversation = conversations.find((c) => c.id === selectedConversation)
    if (!conversation) return

    // Controllo limite messaggi
    if (conversation.messageCount >= conversation.maxMessages) {
      setMessageError("Hai raggiunto il limite di 5 messaggi. Prenota una consulenza per continuare.")
      return
    }

    // Controllo numeri di telefono
    if (containsPhoneNumber(newMessage)) {
      setMessageError("Non è possibile condividere numeri di telefono nei messaggi.")
      return
    }

    // Controllo lunghezza messaggio
    if (newMessage.length > 500) {
      setMessageError("Il messaggio non può superare i 500 caratteri.")
      return
    }

    setIsLoading(true)
    setMessageError("")

    try {
      // Simula invio messaggio
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Aggiungi messaggio alla conversazione (simulato)
      const newMsg = {
        id: Date.now(),
        text: newMessage,
        sender: "user" as const,
        timestamp: new Date(),
        isRead: true,
      }

      conversation.messages.push(newMsg)
      conversation.messageCount++
      conversation.lastMessage = newMessage
      conversation.lastMessageTime = "Ora"

      setNewMessage("")

      toast({
        title: "Messaggio inviato",
        description: "Il tuo messaggio è stato inviato con successo.",
      })

      // Simula risposta automatica dell'operatore dopo 2 secondi
      setTimeout(() => {
        if (conversation.messageCount < conversation.maxMessages) {
          const responses = [
            "Grazie per il tuo messaggio, ti risponderò al più presto!",
            "Ho ricevuto il tuo messaggio, dammi qualche minuto per riflettere.",
            "Interessante quello che mi scrivi, approfondiremo insieme.",
          ]
          const randomResponse = responses[Math.floor(Math.random() * responses.length)]

          conversation.messages.push({
            id: Date.now() + 1,
            text: randomResponse,
            sender: "operator",
            timestamp: new Date(),
            isRead: false,
          })
          conversation.messageCount++
          conversation.lastMessage = randomResponse
          conversation.unreadCount++
        }
      }, 2000)
    } catch (error) {
      setMessageError("Errore nell'invio del messaggio. Riprova.")
    } finally {
      setIsLoading(false)
    }
  }

  const bookConsultation = (operatorId: number) => {
    toast({
      title: "Prenotazione consulenza",
      description: "Reindirizzamento alla pagina di prenotazione...",
    })
    // Qui reindirizzare alla pagina di prenotazione
    console.log("Prenota consulenza con operatore:", operatorId)
  }

  const activeConversations = conversations.filter((c) => c.status === "active" || c.status === "reopened")
  const completedConversations = conversations.filter((c) => c.status === "completed")
  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0)

  return (
    <div className="space-y-6 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 min-h-screen p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
            I Tuoi Messaggi
          </h2>
          <p className="text-muted-foreground">Comunica con i tuoi consulenti spirituali</p>
        </div>
        {totalUnread > 0 && <Badge className="bg-pink-500 text-white text-lg px-3 py-1">{totalUnread} non letti</Badge>}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Lista Conversazioni */}
        <div className="lg:col-span-1">
          <Tabs defaultValue="active" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="active" className="relative text-xs">
                Attive ({activeConversations.length})
                {activeConversations.some((c) => c.unreadCount > 0) && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-pink-500 rounded-full"></div>
                )}
              </TabsTrigger>
              <TabsTrigger value="completed" className="text-xs">
                Completate ({completedConversations.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-2 max-h-[500px] overflow-y-auto">
              {activeConversations.map((conversation) => (
                <Card
                  key={conversation.id}
                  className={`cursor-pointer transition-all duration-300 hover:shadow-md ${
                    selectedConversation === conversation.id
                      ? "ring-2 ring-pink-500 bg-gradient-to-r from-pink-50 to-blue-50"
                      : conversation.unreadCount > 0
                        ? "ring-1 ring-pink-300 bg-gradient-to-r from-pink-25 to-blue-25"
                        : "hover:bg-gradient-to-r hover:from-pink-50 hover:to-blue-50"
                  }`}
                  onClick={() => setSelectedConversation(conversation.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start space-x-3">
                      <div className="relative">
                        <Avatar className="w-10 h-10 ring-2 ring-pink-200">
                          <AvatarImage
                            src={conversation.operatorAvatar || "/placeholder.svg"}
                            alt={conversation.operatorName}
                          />
                          <AvatarFallback className="bg-gradient-to-r from-pink-200 to-blue-200">
                            {conversation.operatorName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        {conversation.unreadCount > 0 && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center">
                            <span className="text-xs text-white font-bold">{conversation.unreadCount}</span>
                          </div>
                        )}
                        {conversation.status === "reopened" && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                            <CheckCircle className="h-2 w-2 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium text-gray-900 truncate text-sm">{conversation.operatorName}</p>
                          <div className="flex items-center space-x-1">
                            <div className="text-xs text-gray-500">
                              {conversation.messageCount}/{conversation.maxMessages}
                            </div>
                            <MessageSquare className="h-3 w-3 text-gray-400" />
                          </div>
                        </div>
                        <p className="text-xs text-pink-600 mb-2">{conversation.operatorSpecialty}</p>
                        <p className="text-sm text-gray-600 truncate mb-2">{conversation.lastMessage}</p>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-500">{conversation.lastMessageTime}</p>
                          {conversation.status === "reopened" && (
                            <Badge variant="outline" className="text-xs px-1 py-0 text-green-600 border-green-300">
                              Riaperta
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="completed" className="space-y-2 max-h-[500px] overflow-y-auto">
              {completedConversations.map((conversation) => (
                <Card
                  key={conversation.id}
                  className={`cursor-pointer transition-all duration-300 hover:shadow-md opacity-75 ${
                    selectedConversation === conversation.id
                      ? "ring-2 ring-gray-400 bg-gradient-to-r from-gray-50 to-gray-100"
                      : "hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100"
                  }`}
                  onClick={() => setSelectedConversation(conversation.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start space-x-3">
                      <Avatar className="w-10 h-10 ring-2 ring-gray-200">
                        <AvatarImage
                          src={conversation.operatorAvatar || "/placeholder.svg"}
                          alt={conversation.operatorName}
                        />
                        <AvatarFallback className="bg-gradient-to-r from-gray-200 to-gray-300">
                          {conversation.operatorName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium text-gray-700 truncate text-sm">{conversation.operatorName}</p>
                          <Badge variant="secondary" className="text-xs px-1 py-0">
                            Completata
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 mb-2">{conversation.operatorSpecialty}</p>
                        <p className="text-sm text-gray-500 truncate mb-2">{conversation.lastMessage}</p>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-400">{conversation.lastMessageTime}</p>
                          <div className="flex items-center space-x-1">
                            <div className="text-xs text-gray-400">
                              {conversation.messageCount}/{conversation.maxMessages}
                            </div>
                            <Ban className="h-3 w-3 text-gray-400" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>

        {/* Area Chat */}
        <div className="lg:col-span-2">
          {selectedConversation ? (
            <Card className="h-[600px] flex flex-col border-0 bg-white/80 backdrop-blur-sm shadow-lg">
              <CardHeader className="border-b bg-gradient-to-r from-pink-50 to-blue-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-12 h-12 ring-2 ring-pink-200">
                      <AvatarImage
                        src={
                          conversations.find((c) => c.id === selectedConversation)?.operatorAvatar || "/placeholder.svg"
                        }
                        alt={conversations.find((c) => c.id === selectedConversation)?.operatorName}
                      />
                      <AvatarFallback className="bg-gradient-to-r from-pink-200 to-blue-200">
                        {conversations
                          .find((c) => c.id === selectedConversation)
                          ?.operatorName.split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">
                        {conversations.find((c) => c.id === selectedConversation)?.operatorName}
                      </CardTitle>
                      <CardDescription>
                        {conversations.find((c) => c.id === selectedConversation)?.operatorSpecialty}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">
                      {conversations.find((c) => c.id === selectedConversation)?.messageCount}/
                      {conversations.find((c) => c.id === selectedConversation)?.maxMessages} messaggi
                    </div>
                    <Badge
                      variant={
                        conversations.find((c) => c.id === selectedConversation)?.status === "completed"
                          ? "secondary"
                          : conversations.find((c) => c.id === selectedConversation)?.status === "reopened"
                            ? "outline"
                            : "default"
                      }
                      className={
                        conversations.find((c) => c.id === selectedConversation)?.status === "active"
                          ? "bg-green-500"
                          : conversations.find((c) => c.id === selectedConversation)?.status === "reopened"
                            ? "text-green-600 border-green-300"
                            : ""
                      }
                    >
                      {conversations.find((c) => c.id === selectedConversation)?.status === "active"
                        ? "Attiva"
                        : conversations.find((c) => c.id === selectedConversation)?.status === "reopened"
                          ? "Riaperta"
                          : "Completata"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {conversations
                  .find((c) => c.id === selectedConversation)
                  ?.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                          message.sender === "user"
                            ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white"
                            : message.sender === "system"
                              ? "bg-orange-100 text-orange-800 border border-orange-200"
                              : "bg-white/10 backdrop-blur-sm border border-white/20 text-gray-800 bg-gray-100"
                        }`}
                      >
                        <p className="text-sm">{message.text}</p>
                        <p
                          className={`text-xs mt-1 ${
                            message.sender === "user"
                              ? "text-pink-100"
                              : message.sender === "system"
                                ? "text-orange-600"
                                : "text-gray-500"
                          }`}
                        >
                          {message.timestamp.toLocaleTimeString("it-IT", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                <div ref={messagesEndRef} />
              </CardContent>

              {/* Area invio messaggio */}
              <div className="border-t p-4 bg-gradient-to-r from-pink-50 to-blue-50">
                {conversations.find((c) => c.id === selectedConversation)?.canMessage ? (
                  <div className="space-y-3">
                    {messageError && (
                      <Alert className="border-red-200 bg-red-50">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800">{messageError}</AlertDescription>
                      </Alert>
                    )}
                    <div className="flex space-x-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => {
                          setNewMessage(e.target.value)
                          setMessageError("")
                        }}
                        onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                        placeholder="Scrivi il tuo messaggio..."
                        className="flex-1"
                        maxLength={500}
                        disabled={isLoading}
                      />
                      <Button
                        onClick={sendMessage}
                        disabled={!newMessage.trim() || isLoading}
                        className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                      >
                        {isLoading ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>
                        Messaggi rimanenti:{" "}
                        {(conversations.find((c) => c.id === selectedConversation)?.maxMessages || 5) -
                          (conversations.find((c) => c.id === selectedConversation)?.messageCount || 0)}
                      </span>
                      <span>{newMessage.length}/500 caratteri</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Alert className="border-orange-200 bg-orange-50">
                      <Info className="h-4 w-4 text-orange-600" />
                      <AlertDescription className="text-orange-800">
                        Hai raggiunto il limite di 5 messaggi. Prenota una consulenza per continuare la conversazione.
                      </AlertDescription>
                    </Alert>
                    <Button
                      onClick={() =>
                        bookConsultation(conversations.find((c) => c.id === selectedConversation)?.operatorId || 0)
                      }
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                    >
                      <Clock className="mr-2 h-4 w-4" />
                      Prenota Consulenza
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ) : (
            <Card className="h-[600px] flex items-center justify-center border-0 bg-white/80 backdrop-blur-sm shadow-lg">
              <div className="text-center space-y-4">
                <MessageSquare className="h-16 w-16 text-pink-400 mx-auto" />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Seleziona una conversazione</h3>
                  <p className="text-gray-600">Scegli una conversazione dalla lista per iniziare a chattare</p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Statistiche Messaggi */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="border-0 bg-gradient-to-r from-pink-500 to-rose-500 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-pink-100">Conversazioni Attive</p>
                <p className="text-3xl font-bold">{activeConversations.length}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-pink-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Messaggi Non Letti</p>
                <p className="text-3xl font-bold">{totalUnread}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-r from-purple-500 to-violet-500 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Conversazioni Completate</p>
                <p className="text-3xl font-bold">{completedConversations.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Box */}
      <Card className="border-0 bg-gradient-to-r from-blue-50 to-purple-50 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <Info className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">Regole della Messaggistica</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Massimo 5 messaggi per conversazione</li>
                <li>• Non è possibile condividere numeri di telefono</li>
                <li>• Non sono ammessi allegati</li>
                <li>• La conversazione si riapre automaticamente dopo una consulenza</li>
                <li>• Mantieni sempre un tono rispettoso</li>
                <li>• Usa i messaggi per conoscere meglio il consulente</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
