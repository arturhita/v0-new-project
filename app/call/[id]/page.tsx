"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Signal,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

// Dati dell'operatore
const operatorData = {
  id: 1,
  name: "Luna Stellare",
  specialty: "Cartomante & Tarocchi",
  rating: 4.9,
  price: 2.5, // €/min
  status: "online",
  avatar: "/placeholder.svg?height=80&width=80",
  phoneNumber: "+39 XXX XXX XXXX", // Numero mascherato
}

// Stati della chiamata
type CallStatus = "connecting" | "ringing" | "connected" | "ended" | "failed"

export default function CallPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [callStatus, setCallStatus] = useState<CallStatus>("connecting")
  const [callDuration, setCallDuration] = useState(0)
  const [userCredits, setUserCredits] = useState(45.5)
  const [callCost, setCallCost] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [isSpeakerOn, setIsSpeakerOn] = useState(false)
  const [connectionQuality, setConnectionQuality] = useState(100)

  const callIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const connectionRef = useRef<NodeJS.Timeout | null>(null)

  // Simula la connessione della chiamata
  useEffect(() => {
    // Verifica crediti prima di iniziare
    if (userCredits < operatorData.price) {
      setCallStatus("failed")
      return
    }

    // Simula il processo di connessione
    const connectCall = async () => {
      setCallStatus("connecting")

      // Simula tempo di connessione
      await new Promise((resolve) => setTimeout(resolve, 2000))
      setCallStatus("ringing")

      // Simula risposta dell'operatore
      await new Promise((resolve) => setTimeout(resolve, 3000))
      setCallStatus("connected")

      // Inizia il contatore
      startCallTimer()
    }

    connectCall()

    return () => {
      if (callIntervalRef.current) {
        clearInterval(callIntervalRef.current)
      }
      if (connectionRef.current) {
        clearInterval(connectionRef.current)
      }
    }
  }, [])

  // Simula qualità connessione
  useEffect(() => {
    if (callStatus === "connected") {
      connectionRef.current = setInterval(() => {
        setConnectionQuality((prev) => {
          const variation = (Math.random() - 0.5) * 20
          return Math.max(60, Math.min(100, prev + variation))
        })
      }, 2000)
    }
  }, [callStatus])

  const startCallTimer = () => {
    callIntervalRef.current = setInterval(() => {
      setCallDuration((prev) => {
        const newDuration = prev + 1
        const newCost = (newDuration / 60) * operatorData.price
        setCallCost(newCost)

        // Verifica se i crediti sono sufficienti
        if (newCost >= userCredits) {
          endCall("insufficient_credits")
          return prev
        }

        return newDuration
      })
    }, 1000)
  }

  const endCall = (reason?: string) => {
    if (callIntervalRef.current) {
      clearInterval(callIntervalRef.current)
    }
    if (connectionRef.current) {
      clearInterval(connectionRef.current)
    }

    setCallStatus("ended")

    // Deduce i crediti
    setUserCredits((prev) => Math.max(0, prev - callCost))

    // Reindirizza dopo 3 secondi
    setTimeout(() => {
      router.push(`/operator/${params.id}`)
    }, 3000)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const formatCurrency = (amount: number) => {
    return `€${amount.toFixed(2)}`
  }

  const getStatusMessage = () => {
    switch (callStatus) {
      case "connecting":
        return "Connessione in corso..."
      case "ringing":
        return "Chiamata in corso..."
      case "connected":
        return "Chiamata attiva"
      case "ended":
        return "Chiamata terminata"
      case "failed":
        return "Chiamata fallita"
      default:
        return ""
    }
  }

  const getStatusColor = () => {
    switch (callStatus) {
      case "connecting":
        return "text-yellow-400"
      case "ringing":
        return "text-blue-400"
      case "connected":
        return "text-green-400"
      case "ended":
        return "text-gray-400"
      case "failed":
        return "text-red-400"
      default:
        return "text-gray-400"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Main Call Interface */}
        <Card className="bg-black/20 backdrop-blur-xl border-white/20 shadow-2xl">
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <Avatar className="w-32 h-32 ring-4 ring-white/30 shadow-2xl">
                  <AvatarImage src={operatorData.avatar || "/placeholder.svg"} alt={operatorData.name} />
                  <AvatarFallback className="bg-gradient-to-r from-pink-200 to-purple-200 text-4xl font-bold">
                    {operatorData.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>

                {/* Status Indicator */}
                <div className="absolute -bottom-2 -right-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      callStatus === "connected"
                        ? "bg-green-500 animate-pulse"
                        : callStatus === "connecting" || callStatus === "ringing"
                          ? "bg-yellow-500 animate-pulse"
                          : callStatus === "failed"
                            ? "bg-red-500"
                            : "bg-gray-500"
                    } ring-4 ring-white/50 shadow-lg`}
                  >
                    <Phone className="h-4 w-4 text-white" />
                  </div>
                </div>
              </div>
            </div>

            <CardTitle className="text-2xl font-bold text-white mb-2">{operatorData.name}</CardTitle>
            <p className="text-pink-300 mb-4">{operatorData.specialty}</p>

            <Badge className={`${getStatusColor()} bg-white/10 border-white/20 text-lg px-4 py-2`}>
              {getStatusMessage()}
            </Badge>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Call Duration & Cost */}
            {callStatus === "connected" && (
              <div className="text-center space-y-2">
                <div className="text-4xl font-mono font-bold text-white">{formatTime(callDuration)}</div>
                <div className="text-xl font-bold text-yellow-400">{formatCurrency(callCost)}</div>
                <div className="text-sm text-white/70">Tariffa: {formatCurrency(operatorData.price)}/min</div>
              </div>
            )}

            {/* Connection Quality */}
            {callStatus === "connected" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-white/70">
                  <span className="flex items-center">
                    <Signal className="h-4 w-4 mr-1" />
                    Qualità connessione
                  </span>
                  <span>{Math.round(connectionQuality)}%</span>
                </div>
                <Progress value={connectionQuality} className="h-2 bg-white/20" />
              </div>
            )}

            {/* Credits Warning */}
            {callStatus === "connected" && userCredits - callCost < 5 && (
              <div className="flex items-center space-x-2 p-3 bg-orange-500/20 border border-orange-400/30 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-orange-400" />
                <span className="text-sm text-orange-300">Crediti in esaurimento</span>
              </div>
            )}

            {/* Call Controls */}
            {callStatus === "connected" && (
              <div className="flex justify-center space-x-4">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setIsMuted(!isMuted)}
                  className={`w-16 h-16 rounded-full border-2 ${
                    isMuted ? "border-red-400/50 bg-red-500/20 text-red-300" : "border-white/30 bg-white/10 text-white"
                  } hover:scale-110 transition-all duration-300`}
                >
                  {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                  className={`w-16 h-16 rounded-full border-2 ${
                    isSpeakerOn
                      ? "border-blue-400/50 bg-blue-500/20 text-blue-300"
                      : "border-white/30 bg-white/10 text-white"
                  } hover:scale-110 transition-all duration-300`}
                >
                  {isSpeakerOn ? <Volume2 className="h-6 w-6" /> : <VolumeX className="h-6 w-6" />}
                </Button>
              </div>
            )}

            {/* End Call Button */}
            {(callStatus === "connected" || callStatus === "ringing") && (
              <div className="flex justify-center">
                <Button
                  onClick={() => endCall()}
                  size="lg"
                  className="w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 shadow-2xl shadow-red-500/50 hover:scale-110 transition-all duration-300"
                >
                  <PhoneOff className="h-8 w-8" />
                </Button>
              </div>
            )}

            {/* Failed Call */}
            {callStatus === "failed" && (
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center space-x-2 p-4 bg-red-500/20 border border-red-400/30 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                  <span className="text-red-300">Crediti insufficienti per la chiamata</span>
                </div>
                <Link href="/dashboard/user/credits">
                  <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Ricarica Crediti
                  </Button>
                </Link>
              </div>
            )}

            {/* Call Ended */}
            {callStatus === "ended" && (
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center space-x-2 p-4 bg-green-500/20 border border-green-400/30 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span className="text-green-300">Chiamata completata</span>
                </div>

                <div className="space-y-2 text-white/80">
                  <div className="flex justify-between">
                    <span>Durata:</span>
                    <span className="font-mono">{formatTime(callDuration)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Costo totale:</span>
                    <span className="font-bold text-yellow-400">{formatCurrency(callCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Crediti rimanenti:</span>
                    <span className="font-bold text-green-400">{formatCurrency(userCredits - callCost)}</span>
                  </div>
                </div>

                <p className="text-sm text-white/60">Reindirizzamento automatico in 3 secondi...</p>
              </div>
            )}

            {/* Current Credits Display */}
            <div className="border-t border-white/10 pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/70 flex items-center">
                  <CreditCard className="h-4 w-4 mr-1" />
                  Crediti disponibili
                </span>
                <span className="font-bold text-green-400">{formatCurrency(userCredits)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back Button */}
        <div className="mt-6 text-center">
          <Link href={`/operator/${params.id}`}>
            <Button variant="ghost" className="text-white/70 hover:text-white">
              ← Torna al profilo
            </Button>
          </Link>
        </div>
      </div>

      {/* Background Animation */}
      <div className="fixed inset-0 pointer-events-none">
        {callStatus === "connecting" || callStatus === "ringing" ? (
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 animate-pulse" />
        ) : callStatus === "connected" ? (
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 animate-pulse" />
        ) : null}
      </div>
    </div>
  )
}
