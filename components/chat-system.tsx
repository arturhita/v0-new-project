"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Send,
  Phone,
  PhoneOff,
  CreditCard,
  Clock,
  Star,
  AlertTriangle,
  X,
  CheckCircle,
  Gift,
  Sparkles,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ChatSystemProps {
  operatorId: string
  operatorName: string
  operatorAvatar?: string
  operatorPrice: number
  operatorStatus: string
  userCredits: number
  onClose: () => void
}

export function ChatSystem({
  operatorId,
  operatorName,
  operatorAvatar,
  operatorPrice,
  operatorStatus,
  userCredits,
  onClose,
}: ChatSystemProps) {
  const [messages, setMessages] = useState<
    Array<{
      id: number
      text: string
      sender: "user" | "operator" | "system"
      timestamp: Date
    }>
  >([])
  const [newMessage, setNewMessage] = useState("")
  const [requestStatus, setRequestStatus] = useState<"pending" | "accepted" | "rejected" | "none">("none")
  const [isConnected, setIsConnected] = useState(false)
  const [sessionTime, setSessionTime] = useState(0)
  const [sessionCost, setSessionCost] = useState(0)
  const [currentCredits, setCurrentCredits] = useState(userCredits)
  const [isTyping, setIsTyping] = useState(false)
  const [requestId, setRequestId] = useState<string | null>(null)

  // Stato per minuti gratuiti
  const [freeMinutes, setFreeMinutes] = useState(0)
  const [freeMinutesUsed, setFreeMinutesUsed] = useState(false)
  const [isUsingFreeMinutes, setIsUsingFreeMinutes] = useState(false)
  const [freeTimeRemaining, setFreeTimeRemaining] = useState(0)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const sessionIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const { toast } = useToast()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Carica dati utente e controlla minuti gratuiti
  useEffect(() => {
    const userData = localStorage.getItem("userData")
    if (userData) {
      const parsedData = JSON.parse(userData)
      setFreeMinutes(parsedData.freeMinutes || 0)
      setFreeMinutesUsed(parsedData.freeMinutesUsed || false)

      // Se ha minuti gratuiti disponibili, li usa automaticamente
      if (parsedData.freeMinutes > 0 && !parsedData.freeMinutesUsed) {
        setIsUsingFreeMinutes(true)
        setFreeTimeRemaining(parsedData.freeMinutes * 60) // Converti in secondi
      }
    }
  }, [])

  // Controlla lo stato della richiesta
  useEffect(() => {
    if (requestId) {
      const checkRequestStatus = () => {
        const requests = JSON.parse(localStorage.getItem("chatRequests") || "[]")
        const request = requests.find((r: any) => r.id === requestId)

        if (request) {
          if (request.status === "accepted" && requestStatus !== "accepted") {
            setRequestStatus("accepted")
            startSession()
            toast({
              title: "Richiesta accettata!",
              description: `${operatorName} ha accettato la tua richiesta di chat.`,
            })
          } else if (request.status === "rejected" && requestStatus !== "rejected") {
            setRequestStatus("rejected")
            toast({
              title: "Richiesta rifiutata",
              description: `${operatorName} non è disponibile al momento.`,
              variant: "destructive",
            })
          }
        }
      }

      const interval = setInterval(checkRequestStatus, 2000)
      return () => clearInterval(interval)
    }
  }, [requestId, requestStatus, operatorName])

  // Gestione timer sessione e costi
  useEffect(() => {
    if (isConnected) {
      sessionIntervalRef.current = setInterval(() => {
        setSessionTime((prev) => {
          const newTime = prev + 1

          if (isUsingFreeMinutes) {
            // Gestione minuti gratuiti
            setFreeTimeRemaining((prevFree) => {
              const newFreeTime = prevFree - 1

              if (newFreeTime <= 0) {
                // Minuti gratuiti finiti
                setIsUsingFreeMinutes(false)

                // Marca i minuti gratuiti come utilizzati
                const userData = JSON.parse(localStorage.getItem("userData") || "{}")
                userData.freeMinutesUsed = true
                userData.freeMinutes = 0
                localStorage.setItem("userData", JSON.stringify(userData))

                // Controlla se ha crediti per continuare
                if (currentCredits < operatorPrice) {
                  endSession()
                  toast({
                    title: "Minuti gratuiti terminati",
                    description: "Ricarica il tuo account per continuare la consulenza.",
                    variant: "destructive",
                  })
                  return newTime
                }

                toast({
                  title: "Minuti gratuiti terminati",
                  description: `La sessione continua con i tuoi crediti (€${operatorPrice}/min)`,
                })
              }

              return Math.max(0, newFreeTime)
            })
          } else {
            // Gestione crediti normali
            const newCost = (newTime / 60) * operatorPrice
            setSessionCost(newCost)

            // Scala i crediti ogni minuto
            if (newTime % 60 === 0) {
              setCurrentCredits((prevCredits) => {
                const newCredits = Math.max(0, prevCredits - operatorPrice)
                if (newCredits <= 0) {
                  endSession()
                  toast({
                    title: "Crediti esauriti",
                    description: "La sessione è terminata per mancanza di crediti.",
                    variant: "destructive",
                  })
                }
                return newCredits
              })
            }
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
  }, [isConnected, operatorPrice, isUsingFreeMinutes, currentCredits])

  const sendChatRequest = () => {
    // Se sta usando minuti gratuiti, non controlla i crediti
    if (!isUsingFreeMinutes && currentCredits < operatorPrice) {
      toast({
        title: "Crediti insufficienti",
        description: "Non hai abbastanza crediti per iniziare la sessione.",
        variant: "destructive",
      })
      return
    }

    const newRequestId = `chat_${Date.now()}`
    const chatRequest = {
      id: newRequestId,
      operatorId,
      operatorName,
      userName: "Utente", // In un'app reale, questo verrebbe dal profilo utente
      userAvatar: "/placeholder.svg?height=40&width=40",
      price: operatorPrice,
      status: "pending",
      createdAt: new Date(),
      message: isUsingFreeMinutes
        ? `Richiesta di chat GRATUITA - 3 minuti di prova`
        : `Richiesta di chat al minuto - Tariffa: €${operatorPrice}/min`,
    }

    // Salva la richiesta
    const existingRequests = JSON.parse(localStorage.getItem("chatRequests") || "[]")
    existingRequests.push(chatRequest)
    localStorage.setItem("chatRequests", JSON.stringify(existingRequests))

    setRequestId(newRequestId)
    setRequestStatus("pending")

    toast({
      title: "Richiesta inviata",
      description: `Richiesta di chat inviata a ${operatorName}. Attendi la risposta...`,
    })
  }

  const startSession = () => {
    setIsConnected(true)
    setSessionTime(0)
    setSessionCost(0)

    // Messaggio di benvenuto dell'operatore
    setTimeout(() => {
      const welcomeMessage = isUsingFreeMinutes
        ? `🎉 Benvenuto! Stai utilizzando i tuoi 3 minuti gratuiti. Come posso aiutarti?`
        : `Ciao! Sono ${operatorName}, benvenuto nella mia consulenza spirituale. Come posso aiutarti oggi?`

      addOperatorMessage(welcomeMessage)
    }, 1000)
  }

  const endSession = () => {
    setIsConnected(false)

    // Salva i dati della sessione
    const sessionData = {
      operatorId,
      operatorName,
      duration: sessionTime,
      cost: isUsingFreeMinutes ? 0 : sessionCost,
      wasFreeTrial: isUsingFreeMinutes,
      timestamp: new Date(),
    }

    localStorage.setItem(`session_${Date.now()}`, JSON.stringify(sessionData))

    const endMessage = isUsingFreeMinutes
      ? "La tua sessione gratuita è terminata. Grazie per aver provato il nostro servizio! 🌟"
      : "La sessione è terminata. Grazie per aver scelto la mia consulenza! 🌟"

    addSystemMessage(endMessage)

    toast({
      title: "Sessione terminata",
      description: isUsingFreeMinutes
        ? `Durata: ${formatTime(sessionTime)} - Sessione gratuita`
        : `Durata: ${formatTime(sessionTime)} - Costo: €${sessionCost.toFixed(2)}`,
    })
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

  const addSystemMessage = (text: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        text,
        sender: "system",
        timestamp: new Date(),
      },
    ])
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
      const responses = [
        "Vedo una forte energia intorno a te. Dimmi di più su questa situazione.",
        "Le carte mi stanno mostrando qualcosa di interessante... Lascia che approfondisca.",
        "Sento che c'è qualcosa di importante che vuoi condividere. Sono qui per ascoltarti.",
        "L'energia che percepisco suggerisce che sei in un momento di trasformazione.",
        "Vedo una svolta importante nel tuo futuro prossimo. Vuoi che esploriamo insieme?",
      ]
      const randomResponse = responses[Math.floor(Math.random() * responses.length)]
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

  const canSendRequest =
    operatorStatus === "online" && (isUsingFreeMinutes || currentCredits >= operatorPrice) && requestStatus === "none"

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl h-[600px] flex flex-col bg-white shadow-2xl">
        <CardHeader className="border-b bg-gradient-to-r from-pink-50 to-blue-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="w-12 h-12 ring-2 ring-pink-200">
                <AvatarImage src={operatorAvatar || "/placeholder.svg"} alt={operatorName} />
                <AvatarFallback className="bg-gradient-to-r from-pink-200 to-purple-200">
                  {operatorName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">{operatorName}</CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge
                    variant={operatorStatus === "online" ? "default" : "secondary"}
                    className={operatorStatus === "online" ? "bg-green-500" : ""}
                  >
                    {operatorStatus === "online" ? "Online" : "Offline"}
                  </Badge>

                  {isUsingFreeMinutes ? (
                    <Badge className="bg-gradient-to-r from-green-500 to-emerald-500">
                      <Gift className="w-3 h-3 mr-1" />
                      GRATIS
                    </Badge>
                  ) : (
                    <span className="text-sm text-gray-600">€{operatorPrice}/min</span>
                  )}

                  {requestStatus === "pending" && <Badge className="bg-yellow-500">In attesa...</Badge>}
                  {requestStatus === "accepted" && <Badge className="bg-green-500">Accettata</Badge>}
                  {requestStatus === "rejected" && <Badge className="bg-red-500">Rifiutata</Badge>}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {isConnected && (
                <div className="text-right">
                  <div className="text-sm text-gray-600">Durata: {formatTime(sessionTime)}</div>
                  {isUsingFreeMinutes ? (
                    <div className="font-bold text-green-600">
                      <Gift className="w-4 h-4 inline mr-1" />
                      Tempo gratuito: {formatTime(freeTimeRemaining)}
                    </div>
                  ) : (
                    <div className="font-bold text-green-600">{formatCurrency(sessionCost)}</div>
                  )}
                </div>
              )}
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <div className="flex-1 flex">
          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {requestStatus === "none" && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔮</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {isUsingFreeMinutes ? "Inizia la tua consulenza gratuita" : "Richiedi una consulenza"}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {isUsingFreeMinutes
                      ? `Usa i tuoi 3 minuti gratuiti con ${operatorName}`
                      : `Invia una richiesta di chat a ${operatorName}`}
                  </p>
                  {isUsingFreeMinutes ? (
                    <div className="flex items-center justify-center space-x-2 text-green-600 mb-4">
                      <Sparkles className="w-5 h-5" />
                      <span className="font-medium">3 minuti completamente gratuiti!</span>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Costo: {formatCurrency(operatorPrice)} al minuto</p>
                  )}
                </div>
              )}

              {requestStatus === "pending" && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="h-8 w-8 text-yellow-600 animate-pulse" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Richiesta in attesa</h3>
                  <p className="text-gray-600 mb-4">La tua richiesta è stata inviata a {operatorName}</p>
                  <p className="text-sm text-gray-500">Attendi la risposta dell'operatore...</p>
                </div>
              )}

              {requestStatus === "rejected" && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <X className="h-8 w-8 text-red-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-red-800 mb-2">Richiesta rifiutata</h3>
                  <p className="text-gray-600 mb-4">{operatorName} non è disponibile al momento</p>
                  <Button
                    onClick={() => {
                      setRequestStatus("none")
                      setRequestId(null)
                    }}
                    variant="outline"
                  >
                    Riprova più tardi
                  </Button>
                </div>
              )}

              {requestStatus === "accepted" && !isConnected && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-green-800 mb-2">Richiesta accettata!</h3>
                  <p className="text-gray-600 mb-4">{operatorName} ha accettato la tua richiesta</p>
                  <p className="text-sm text-gray-500">La sessione inizierà automaticamente...</p>
                </div>
              )}

              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                      message.sender === "user"
                        ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white"
                        : message.sender === "system"
                          ? "bg-blue-100 text-blue-800 border border-blue-200"
                          : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.sender === "user"
                          ? "text-pink-100"
                          : message.sender === "system"
                            ? "text-blue-600"
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

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-2xl">
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

            {/* Input Area */}
            <div className="border-t p-4">
              {requestStatus === "none" ? (
                <div className="space-y-3">
                  {!canSendRequest && (
                    <Alert
                      className={
                        !isUsingFreeMinutes && currentCredits < operatorPrice
                          ? "border-red-200 bg-red-50"
                          : "border-orange-200 bg-orange-50"
                      }
                    >
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        {!isUsingFreeMinutes && currentCredits < operatorPrice
                          ? "Crediti insufficienti per iniziare la sessione."
                          : "L'operatore non è disponibile al momento."}
                      </AlertDescription>
                    </Alert>
                  )}
                  <Button
                    onClick={sendChatRequest}
                    disabled={!canSendRequest}
                    className={`w-full ${
                      isUsingFreeMinutes
                        ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                        : "bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                    }`}
                  >
                    {isUsingFreeMinutes ? (
                      <>
                        <Gift className="mr-2 h-4 w-4" />
                        Inizia Chat Gratuita (3 min)
                      </>
                    ) : (
                      <>
                        <Phone className="mr-2 h-4 w-4" />
                        Richiedi Chat (€{operatorPrice}/min)
                      </>
                    )}
                  </Button>
                </div>
              ) : isConnected ? (
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                      placeholder="Scrivi il tuo messaggio..."
                      className="flex-1"
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex justify-between">
                    <Button onClick={endSession} variant="destructive" size="sm">
                      <PhoneOff className="mr-2 h-4 w-4" />
                      Termina Sessione
                    </Button>
                    <div className="text-sm text-gray-600">
                      {isUsingFreeMinutes ? (
                        <>Tempo gratuito: {formatTime(freeTimeRemaining)}</>
                      ) : (
                        <>
                          Tempo: {formatTime(sessionTime)} | Costo: {formatCurrency(sessionCost)}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="w-80 border-l bg-gray-50 p-4 space-y-4">
            {/* Credits/Free Minutes Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center">
                  {isUsingFreeMinutes ? (
                    <>
                      <Gift className="mr-2 h-4 w-4 text-green-500" />
                      Minuti Gratuiti
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4 text-green-500" />I Tuoi Crediti
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  {isUsingFreeMinutes ? (
                    <>
                      <div className="text-2xl font-bold text-green-600 mb-2 flex items-center justify-center">
                        <Sparkles className="w-6 h-6 mr-2" />3 MIN
                      </div>
                      <div className="text-xs text-green-600">Sessione completamente gratuita!</div>
                    </>
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-green-600 mb-2">{formatCurrency(currentCredits)}</div>
                      <div className="text-xs text-gray-500">Crediti disponibili</div>
                    </>
                  )}
                </div>

                {!isUsingFreeMinutes && currentCredits < operatorPrice && (
                  <Alert className="mt-3 border-orange-200 bg-orange-50">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    <AlertDescription className="text-orange-700 text-xs">
                      Crediti insufficienti per questa consulenza
                    </AlertDescription>
                  </Alert>
                )}

                {!isUsingFreeMinutes && (
                  <Button className="w-full mt-3 text-xs" size="sm">
                    <CreditCard className="mr-2 h-3 w-3" />
                    Ricarica Crediti
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Session Info */}
            {isConnected && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-blue-500" />
                    Sessione Attiva
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Durata:</span>
                    <span className="font-mono">{formatTime(sessionTime)}</span>
                  </div>
                  {isUsingFreeMinutes ? (
                    <div className="flex justify-between text-xs">
                      <span>Tempo gratuito:</span>
                      <span className="font-bold text-green-600">{formatTime(freeTimeRemaining)}</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between text-xs">
                        <span>Costo attuale:</span>
                        <span className="font-bold text-yellow-600">{formatCurrency(sessionCost)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Tariffa:</span>
                        <span className="text-green-600">{formatCurrency(operatorPrice)}/min</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Operator Rating */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center">
                  <Star className="mr-2 h-4 w-4 text-yellow-400" />
                  Valutazione
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 mb-2">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-lg font-bold">4.9</span>
                  </div>
                  <div className="text-xs text-gray-500">Rating medio</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Card>
    </div>
  )
}
