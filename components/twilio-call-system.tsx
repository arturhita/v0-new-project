"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Phone, PhoneOff, Timer, Coins, AlertTriangle, CheckCircle, XCircle } from "lucide-react"
import { initiateCallAction, endCallAction, getUserWalletAction } from "@/lib/actions/calls.actions"
import { useTimer } from "@/hooks/use-timer"
import { cn } from "@/lib/utils"

interface Operator {
  id: string
  name: string
  avatar: string
  phone: string
  ratePerMinute: number
  isOnline: boolean
}

interface TwilioCallSystemProps {
  operator: Operator
  clientId: string
  clientName: string
  initialWallet: number
}

type CallStatus = "idle" | "initiating" | "ringing" | "connected" | "ended" | "error"

export function TwilioCallSystem({ operator, clientId, clientName, initialWallet }: TwilioCallSystemProps) {
  const [callStatus, setCallStatus] = useState<CallStatus>("idle")
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [wallet, setWallet] = useState(initialWallet)
  const [error, setError] = useState<string | null>(null)
  const [estimatedCost, setEstimatedCost] = useState<number>(0)
  const [currentCost, setCurrentCost] = useState<number>(0)
  const [operatorCommission, setOperatorCommission] = useState<number>(40) // Default 40%

  const { time, isRunning, startTimer, stopTimer, resetTimer } = useTimer()

  // Aggiorna wallet periodicamente
  useEffect(() => {
    const interval = setInterval(async () => {
      const newWallet = await getUserWalletAction(clientId)
      setWallet(newWallet)
    }, 30000) // Ogni 30 secondi

    return () => clearInterval(interval)
  }, [clientId])

  // Calcola costo in tempo reale durante la chiamata
  useEffect(() => {
    if (callStatus === "connected" && isRunning) {
      const interval = setInterval(() => {
        const minutes = Math.ceil(time / 60)
        const cost = minutes * operator.ratePerMinute
        setCurrentCost(cost)

        // Controlla se il credito è sufficiente
        if (cost >= wallet) {
          handleEndCall()
          setError("Credito esaurito. Chiamata terminata.")
        }
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [callStatus, isRunning, time, operator.ratePerMinute, wallet])

  const handleStartCall = async () => {
    try {
      setCallStatus("initiating")
      setError(null)

      // Verifica credito minimo
      const minimumCredit = operator.ratePerMinute * 2
      if (wallet < minimumCredit) {
        setError(`Credito insufficiente. Necessari almeno €${minimumCredit.toFixed(2)}`)
        setCallStatus("error")
        return
      }

      const result = await initiateCallAction(clientId, operator.id, operator.phone, operator.ratePerMinute)

      if (result.success && result.sessionId) {
        setSessionId(result.sessionId)
        setEstimatedCost(result.estimatedCost || 0)
        setCallStatus("ringing")

        // Simula connessione dopo 3-5 secondi
        setTimeout(
          () => {
            setCallStatus("connected")
            startTimer()
          },
          Math.random() * 2000 + 3000,
        )
      } else {
        setError(result.error || "Errore sconosciuto")
        setCallStatus("error")
      }
    } catch (error) {
      console.error("Error starting call:", error)
      setError("Errore nel sistema. Riprova più tardi.")
      setCallStatus("error")
    }
  }

  const handleEndCall = async () => {
    if (sessionId) {
      await endCallAction(sessionId)
    }

    stopTimer()
    setCallStatus("ended")

    // Reset dopo 5 secondi
    setTimeout(() => {
      setCallStatus("idle")
      setSessionId(null)
      setCurrentCost(0)
      setError(null)
      resetTimer()
    }, 5000)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getStatusColor = () => {
    switch (callStatus) {
      case "connected":
        return "bg-green-500"
      case "ringing":
        return "bg-yellow-500"
      case "error":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusText = () => {
    switch (callStatus) {
      case "idle":
        return "Pronto per chiamare"
      case "initiating":
        return "Avvio chiamata..."
      case "ringing":
        return "Chiamata in corso..."
      case "connected":
        return "Connesso"
      case "ended":
        return "Chiamata terminata"
      case "error":
        return "Errore"
      default:
        return "Sconosciuto"
    }
  }

  const canStartCall = callStatus === "idle" && operator.isOnline && wallet >= operator.ratePerMinute * 2

  const userType = "operator" // TODO: Replace with actual user type

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="relative">
            <img
              src={operator.avatar || "/placeholder.svg"}
              alt={operator.name}
              className="w-16 h-16 rounded-full object-cover"
            />
            <div
              className={cn(
                "absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white",
                operator.isOnline ? "bg-green-500" : "bg-gray-400",
              )}
            />
          </div>
          <div>
            <CardTitle className="text-lg">{operator.name}</CardTitle>
            <p className="text-sm text-muted-foreground">€{operator.ratePerMinute.toFixed(2)}/min</p>
          </div>
        </div>

        <Badge variant="outline" className={cn("mx-auto", getStatusColor(), "text-white")}>
          {getStatusText()}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Wallet Info */}
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-medium">Credito</span>
          </div>
          <span className="font-bold">€{wallet.toFixed(2)}</span>
        </div>

        {/* Call Timer & Cost */}
        {(callStatus === "connected" || callStatus === "ended") && (
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center justify-center p-3 bg-blue-50 rounded-lg">
              <Timer className="h-4 w-4 text-blue-500 mr-2" />
              <span className="font-mono font-bold">{formatTime(time)}</span>
            </div>
            <div className="flex items-center justify-center p-3 bg-green-50 rounded-lg">
              <Coins className="h-4 w-4 text-green-500 mr-2" />
              <span className="font-bold">€{currentCost.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Success Alert */}
        {callStatus === "ended" && !error && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>Chiamata completata. Costo totale: €{currentCost.toFixed(2)}</AlertDescription>
          </Alert>
        )}

        {/* Call Controls */}
        <div className="flex gap-3">
          {callStatus === "idle" && (
            <Button
              onClick={handleStartCall}
              disabled={!canStartCall}
              className="flex-1 bg-green-600 hover:bg-green-700"
              size="lg"
            >
              <Phone className="mr-2 h-5 w-5" />
              Chiama Ora
            </Button>
          )}

          {(callStatus === "ringing" || callStatus === "connected") && (
            <Button onClick={handleEndCall} variant="destructive" className="flex-1" size="lg">
              <PhoneOff className="mr-2 h-5 w-5" />
              Termina
            </Button>
          )}

          {callStatus === "error" && (
            <Button
              onClick={() => {
                setCallStatus("idle")
                setError(null)
              }}
              variant="outline"
              className="flex-1"
              size="lg"
            >
              Riprova
            </Button>
          )}
        </div>

        {/* Estimated Cost */}
        {callStatus === "idle" && canStartCall && (
          <div className="text-center text-sm text-muted-foreground">
            Costo stimato per 5 min: €{(operator.ratePerMinute * 5).toFixed(2)}
          </div>
        )}

        {/* Insufficient Credit Warning */}
        {!canStartCall && callStatus === "idle" && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              {!operator.isOnline
                ? "Operatore non disponibile"
                : `Credito insufficiente. Minimo richiesto: €${(operator.ratePerMinute * 2).toFixed(2)}`}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      {/* Commission Info - mostra solo agli operatori */}
      {userType === "operator" && (
        <div className="text-center text-xs text-muted-foreground mt-2">
          La tua commissione: {operatorCommission}% • Piattaforma: {100 - operatorCommission}%
        </div>
      )}
    </Card>
  )
}
