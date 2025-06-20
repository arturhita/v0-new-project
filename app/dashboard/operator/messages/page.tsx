"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, Send, AlertCircle, CheckCircle, Info, Clock } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"

// Dati delle conversazioni dal punto di vista dell'operatore
const conversations = [
  {
    id: 1,
    userId: 1,
    userName: "Mario Rossi",
    userNickname: "@mario_mystic",
    userAvatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "Grazie mille per i consigli! Sei stata molto precisa.",
    lastMessageTime: "30 min fa",
    unreadCount: 1,
    messageCount: 4,
    maxMessages: 5,
    status: "active",
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
        text: "Ciao Mario! Sarò felice di aiutarti. Dimmi pure cosa ti preoccupa nel tuo cuore.",
        sender: "operator",
        timestamp: new Date(Date.now() - 3600000 * 2.5),
        isRead: true,
      },
      {
        id: 3,
        text: "È complicato... la mia ex mi ha lasciato un mese fa e non so se dovrei provare a riconquistarla.",
        sender: "user",
        timestamp: new Date(Date.now() - 3600000 * 2),
        isRead: true,
      },
      {
        id: 4,
        text: "Grazie mille per i consigli! Sei stata molto precisa.",
        sender: "user",
        timestamp: new Date(Date.now() - 1800000),
        isRead: false,
      },
    ],
  },
  {
    id: 2,
    userId: 2,
    userName: "Giulia Verdi",
    userNickname: "@giulia_stars",
    userAvatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "Hai raggiunto il limite di 5 messaggi. Prenota una consulenza per continuare.",
    lastMessageTime: "2 giorni fa",
    unreadCount: 0,
    messageCount: 5,
    maxMessages: 5,
    status: "completed",
    canMessage: false,
    lastConsultationDate: null,
    messages: [
      {
        id: 1,
        text: "Ciao, ho bisogno di un consiglio per il lavoro.",
        sender: "user",
        timestamp: new Date(Date.now() - 86400000 * 3),
        isRead: true,
      },
      {
        id: 2,
        text: "Ciao Giulia! Dimmi tutto, sono qui per aiutarti.",
        sender: "operator",
        timestamp: new Date(Date.now() - 86400000 * 3 + 1800000),
        isRead: true,
      },
      {
        id: 3,
        text: "Ho ricevuto due offerte di lavoro e non so quale scegliere.",
        sender: "user",
        timestamp: new Date(Date.now() - 86400000 * 2.5),
        isRead: true,
      },
      {
        id: 4,
        text: "Vedo che una delle due opportunità ti porterà maggiore soddisfazione personale.",
        sender: "operator",
        timestamp: new Date(Date.now() - 86400000 * 2),
        isRead: true,
      },
      {
        id: 5,
        text: "Hai raggiunto il limite di 5 messaggi. Prenota una consulenza per continuare.",
        sender: "system",
        timestamp: new Date(Date.now() - 86400000 * 2),
        isRead: true,
      },
    ],
  },
  {
    id: 3,
    userId: 3,
    userName: "Luca Ferrari",
    userNickname: "@luca_seeker",
    userAvatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "Ciao Luna, ho bisogno di una lettura dei tarocchi urgente.",
    lastMessageTime: "5 min fa",
    unreadCount: 2,
    messageCount: 1,
    maxMessages: 5,
    status: "reopened",
    canMessage: true,
    lastConsultationDate: new Date(Date.now() - 3600000),
    messages: [
      {
        id: 1,
        text: "Ciao Luna, ho bisogno di una lettura dei tarocchi urgente.",
        sender: "user",
        timestamp: new Date(Date.now() - 300000),
        isRead: false,
      },
    ],
  },
]

export default function OperatorMessagesPage() {
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
      setMessageError("Conversazione completata. L'utente deve prenotare una consulenza per continuare.")
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
        sender: "operator" as const,
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
    } catch (error) {
      setMessageError("Errore nell'invio del messaggio. Riprova.")
    } finally {
      setIsLoading(false)
    }
  }

  const reopenConversation = (conversationId: number) => {
    const conversation = conversations.find((c) => c.id === conversationId)
    if (conversation) {
      conversation.status = "reopened"
      conversation.messageCount = 0
      conversation.canMessage = true
      conversation.lastConsultationDate = new Date()

      // Aggiungi messaggio di sistema
      conversation.messages.push({
        id: Date.now(),
        text: "Conversazione riaperta dopo la consulenza! Come ti senti?",
        sender: "system",
        timestamp: new Date(),
        isRead: false,
      })

      toast({
        title: "Conversazione riaperta",
        description: "La conversazione è stata riaperta dopo la consulenza.",
      })
    }
  }

  const activeConversations = conversations.filter((c) => c.status === "active" || c.status === "reopened")
  const completedConversations = conversations.filter((c) => c.status === "completed")
  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0)

  return (
    <div className="space-y-6 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 min-h-screen p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
            Messaggi Clienti
          </h2>
          <p className="text-muted-foreground">Gestisci le conversazioni con i tuoi clienti (limite 5 messaggi)</p>
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

            <TabsContent value="active" className="space-y-2 h-[400px] overflow-y-auto">
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
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-xs">{conversation.userName[0]}</AvatarFallback>
                        </Avatar>
                        {conversation.unreadCount > 0 && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-pink-500 rounded-full flex items-center justify-center">
                            <span className="text-xs text-white font-bold">{conversation.unreadCount}</span>
                          </div>
                        )}
                        {conversation.status === "reopened" && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{conversation.userName}</p>
                        <p className="text-xs text-gray-500 truncate">{conversation.lastMessage}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-400">{conversation.lastMessageTime}</span>
                          <Badge variant="outline" className="text-xs">
                            {conversation.messageCount}/{conversation.maxMessages}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="completed" className="space-y-2 h-[400px] overflow-y-auto">
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
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs">{conversation.userName[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{conversation.userName}</p>
                        <p className="text-xs text-gray-500 truncate">{conversation.lastMessage}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-400">{conversation.lastMessageTime}</span>
                          <Badge variant="outline" className="text-xs">
                            {conversation.messageCount}/{conversation.maxMessages}
                          </Badge>
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
              <CardHeader className="border-b bg-gradient-to-r from-pink-50 to-blue-50 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10 ring-2 ring-pink-200">
                      <AvatarImage
                        src={conversations.find((c) => c.id === selectedConversation)?.userAvatar || "/placeholder.svg"}
                        alt={conversations.find((c) => c.id === selectedConversation)?.userName}
                      />
                      <AvatarFallback className="bg-gradient-to-r from-pink-200 to-blue-200">
                        {conversations
                          .find((c) => c.id === selectedConversation)
                          ?.userName.split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">
                        {conversations.find((c) => c.id === selectedConversation)?.userName}
                      </CardTitle>
                      <CardDescription>
                        {conversations.find((c) => c.id === selectedConversation)?.userNickname}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600 mb-1">
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
                      className={`flex ${message.sender === "operator" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                          message.sender === "operator"
                            ? "bg-gradient-to-r from-pink-500 to-blue-500 text-white"
                            : message.sender === "system"
                              ? "bg-green-100 text-green-800 border border-green-200"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        <p className="text-sm">{message.text}</p>
                        <p
                          className={`text-xs mt-1 ${
                            message.sender === "operator"
                              ? "text-pink-100"
                              : message.sender === "system"
                                ? "text-green-600"
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
                        placeholder="Rispondi al cliente..."
                        className="flex-1"
                        maxLength={500}
                        disabled={isLoading}
                      />
                      <Button
                        onClick={sendMessage}
                        disabled={!newMessage.trim() || isLoading}
                        className="bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600"
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
                        Conversazione completata. Il cliente deve prenotare una consulenza per continuare.
                      </AlertDescription>
                    </Alert>
                    <Button
                      onClick={() => reopenConversation(selectedConversation)}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                    >
                      <Clock className="mr-2 h-4 w-4" />
                      Riapri Conversazione (Dopo Consulenza)
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
                  <p className="text-gray-600">Scegli una conversazione dalla lista per rispondere ai tuoi clienti</p>
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
              <h3 className="font-semibold text-gray-900 mb-2">Sistema Messaggi (Limite 5)</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Ogni conversazione ha un limite di 5 messaggi totali</li>
                <li>• Non condividere mai numeri di telefono nei messaggi</li>
                <li>• Le conversazioni si riaprono automaticamente dopo una consulenza</li>
                <li>• Rispondi sempre in modo professionale e rispettoso</li>
                <li>• Usa i messaggi per presentarti e spiegare i tuoi servizi</li>
                <li>• Puoi riaprire manualmente le conversazioni dopo una consulenza</li>
                <li>• I messaggi sono limitati a 500 caratteri</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
