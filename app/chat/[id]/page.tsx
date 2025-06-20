"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Send,
  Phone,
  PhoneOff,
  CreditCard,
  Clock,
  Star,
  SnowflakeIcon as Crystal,
  AlertTriangle,
  CheckCircle,
  Sparkles,
} from "lucide-react"
import Link from "next/link"

// Dati dell'operatore
const operatorData = {
  id: 1,
  name: "Luna Stellare",
  specialty: "Cartomante & Tarocchi",
  rating: 4.9,
  price: 2.5, // €/min
  status: "online",
  avatar: "/placeholder.svg?height=80&width=80",
}

// Messaggi predefiniti dell'operatore
const operatorMessages = [
  "Ciao! Sono Luna Stellare, benvenuto nella mia consulenza spirituale. Come posso aiutarti oggi?",
  "Sento una forte energia intorno a te. Dimmi, c'è qualcosa di specifico che ti preoccupa?",
  "Le carte mi stanno mostrando qualcosa di interessante... Vuoi che approfondisca questo aspetto?",
  "Vedo una svolta importante nel tuo futuro prossimo. Ti va di esplorare insieme questo percorso?",
  "L'energia che percepisco suggerisce che sei in un momento di trasformazione. È così?",
]

export default function ChatPage({ params }: { params: { id: string } }) {
  const [messages, setMessages] = useState<
    Array<{
      id: number
      text: string
      sender: "user" | "operator"
      timestamp: Date
    }>
  >([])
  const [newMessage, setNewMessage] = useState("")
  const [isConnected, setIsConnected] = useState(false)
  const [sessionTime, setSessionTime] = useState(0)
  const [userCredits, setUserCredits] = useState(45.5) // Crediti utente
  const [sessionCost, setSessionCost] = useState(0)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const sessionIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Scroll automatico ai nuovi messaggi
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Gestione timer sessione e costi
  useEffect(() => {
    if (isConnected) {
      sessionIntervalRef.current = setInterval(() => {
        setSessionTime((prev) => {
          const newTime = prev + 1
          const newCost = (newTime / 60) * operatorData.price
          setSessionCost(newCost)

          // Verifica se i crediti sono sufficienti
          if (newCost >= userCredits) {
            endSession()
            return prev
          }

          return newTime
        })
      }, 1000)
    } else {
      if (sessionIntervalRef.current) {
        clearInterval(sessionIntervalRef.current)
      }
    }

    return () => {
      if (sessionIntervalRef.current) {
        clearInterval(sessionIntervalRef.current)
      }
    }
  }, [isConnected, userCredits])

  const startSession = () => {
    setIsConnected(true)
    setSessionTime(0)
    setSessionCost(0)

    // Messaggio di benvenuto dell'operatore
    setTimeout(() => {
      addOperatorMessage(operatorMessages[0])
    }, 1000)
  }

  const endSession = () => {
    setIsConnected(false)
    setUserCredits((prev) => Math.max(0, prev - sessionCost))

    // Messaggio di fine sessione
    addOperatorMessage("La sessione è terminata. Grazie per aver scelto la mia consulenza! 🌟")
  }

  const addOperatorMessage = (text: string) => {
    setIsTyping(true)
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          text,
          sender: "operator",
          timestamp: new Date(),
        },
      ])
      setIsTyping(false)
    }, 1500)
  }

  const sendMessage = () => {
    if (!newMessage.trim() || !isConnected) return

    // Aggiungi messaggio utente
    const userMessage = {
      id: Date.now(),
      text: newMessage,
      sender: "user" as const,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setNewMessage("")

    // Simula risposta dell'operatore
    setTimeout(() => {
      const randomResponse = operatorMessages[Math.floor(Math.random() * operatorMessages.length)]
      addOperatorMessage(randomResponse)
    }, 2000)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const formatCurrency = (amount: number) => {
    return `€${amount.toFixed(2)}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href={`/operator/${params.id}`} className="flex items-center space-x-3 group">
            <Avatar className="w-12 h-12 ring-2 ring-pink-200">
              <AvatarImage src={operatorData.avatar || "/placeholder.svg"} alt={operatorData.name} />
              <AvatarFallback className="bg-gradient-to-r from-pink-200 to-purple-200">
                {operatorData.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-lg font-bold text-white group-hover:text-pink-300 transition-colors">
                {operatorData.name}
              </h1>
              <p className="text-sm text-pink-300">{operatorData.specialty}</p>
            </div>
          </Link>

          <div className="flex items-center space-x-4">
            <Badge
              variant={operatorData.status === "online" ? "default" : "secondary"}
              className={operatorData.status === "online" ? "bg-green-500" : ""}
            >
              {operatorData.status}
            </Badge>
            <div className="text-right">
              <div className="text-sm text-white/70">Tariffa</div>
              <div className="font-bold text-green-400">{formatCurrency(operatorData.price)}/min</div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Chat Area */}
          <div className="lg:col-span-3">
            <Card className="h-[600px] bg-black/20 backdrop-blur-xl border-white/20 flex flex-col">
              <CardHeader className="border-b border-white/10">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center">
                    <Sparkles className="mr-2 h-5 w-5 text-pink-400" />
                    Consulenza Spirituale
                  </CardTitle>
                  {isConnected ? (
                    <Button
                      onClick={endSession}
                      variant="destructive"
                      size="sm"
                      className="bg-red-500/20 border border-red-400/30 text-red-300 hover:bg-red-500/30"
                    >
                      <PhoneOff className="mr-2 h-4 w-4" />
                      Termina
                    </Button>
                  ) : (
                    <Button
                      onClick={startSession}
                      disabled={operatorData.status !== "online" || userCredits < operatorData.price}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                    >
                      <Phone className="mr-2 h-4 w-4" />
                      Inizia Chat
                    </Button>
                  )}
                </div>
              </CardHeader>

              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {!isConnected && messages.length === 0 && (
                  <div className="text-center py-12">
                    <Crystal className="h-16 w-16 text-pink-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">Pronto per la tua consulenza?</h3>
                    <p className="text-white/70 mb-4">Clicca "Inizia Chat" per connetterti con {operatorData.name}</p>
                    <p className="text-sm text-white/50">Costo: {formatCurrency(operatorData.price)} al minuto</p>
                  </div>
                )}

                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                        message.sender === "user"
                          ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white"
                          : "bg-white/10 backdrop-blur-sm border border-white/20 text-white"
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <p className={`text-xs mt-1 ${message.sender === "user" ? "text-pink-100" : "text-white/60"}`}>
                        {message.timestamp.toLocaleTimeString("it-IT", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-4 py-2 rounded-2xl">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-100"></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-200"></div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </CardContent>

              {isConnected && (
                <div className="border-t border-white/10 p-4">
                  <div className="flex space-x-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                      placeholder="Scrivi il tuo messaggio..."
                      className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      disabled={!isConnected}
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={!newMessage.trim() || !isConnected}
                      className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            {/* Session Info */}
            <Card className="bg-black/20 backdrop-blur-xl border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Clock className="mr-2 h-5 w-5 text-blue-400" />
                  Sessione
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-white/70">Durata:</span>
                  <span className="font-mono text-white">{formatTime(sessionTime)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Costo attuale:</span>
                  <span className="font-bold text-yellow-400">{formatCurrency(sessionCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Tariffa:</span>
                  <span className="text-green-400">{formatCurrency(operatorData.price)}/min</span>
                </div>
              </CardContent>
            </Card>

            {/* Credits Info */}
            <Card className="bg-black/20 backdrop-blur-xl border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <CreditCard className="mr-2 h-5 w-5 text-green-400" />I Tuoi Crediti
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400 mb-2">{formatCurrency(userCredits)}</div>
                  <div className="text-sm text-white/70">Crediti disponibili</div>
                </div>

                {userCredits < 10 && (
                  <div className="flex items-center space-x-2 p-3 bg-orange-500/20 border border-orange-400/30 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-orange-400" />
                    <span className="text-sm text-orange-300">Crediti in esaurimento</span>
                  </div>
                )}

                {userCredits >= operatorData.price && (
                  <div className="flex items-center space-x-2 p-3 bg-green-500/20 border border-green-400/30 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span className="text-sm text-green-300">Crediti sufficienti</span>
                  </div>
                )}

                <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Ricarica Crediti
                </Button>
              </CardContent>
            </Card>

            {/* Operator Rating */}
            <Card className="bg-black/20 backdrop-blur-xl border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Star className="mr-2 h-5 w-5 text-yellow-400" />
                  Valutazione
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                    <span className="text-2xl font-bold text-white">{operatorData.rating}</span>
                  </div>
                  <div className="text-sm text-white/70">Rating medio</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
