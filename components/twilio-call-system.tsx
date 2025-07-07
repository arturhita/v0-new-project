"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Phone, PhoneOff, Timer, AlertTriangle, CheckCircle, Loader2 } from "lucide-react"
import { initiateCallAction, endCallAction, getUserWalletAction } from "@/lib/actions/calls.actions"
import { useTimer } from "@/hooks/use-timer"

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
  initialWallet: number
}

type CallStatus = "idle" | "initiating" | "ringing" | "connected" | "ended" | "error"

export function TwilioCallSystem({ operator, clientId, initialWallet }: TwilioCallSystemProps) {
  const [callStatus, setCallStatus] = useState<CallStatus>("idle")
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [wallet, setWallet] = useState(initialWallet)
  const [error, setError] = useState<string | null>(null)
  const [currentCost, setCurrentCost] = useState<number>(0)

  const { time, isRunning, startTimer, stopTimer, resetTimer } = useTimer()

  useEffect(() => {
    if (callStatus === "connected" && isRunning) {
      const interval = setInterval(() => {
        const minutes = Math.ceil(time / 60)
        const cost = minutes * operator.ratePerMinute
        setCurrentCost(cost)

        if (wallet - cost < operator.ratePerMinute) {
          handleEndCall()
          setError("Credito quasi esaurito. Chiamata terminata.")
        }
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [callStatus, isRunning, time, operator.ratePerMinute, wallet])

  const handleStartCall = async () => {
    setCallStatus("initiating")
    setError(null)

    const result = await initiateCallAction(clientId, operator.id, operator.phone, operator.ratePerMinute)

    if (result.success && result.sessionId) {
      setSessionId(result.sessionId)
      setCallStatus("ringing")
      // In un'app reale, un webhook da Twilio aggiornerebbe lo stato a "connected"
      // Qui simuliamo per l'UI
      setTimeout(() => {
        if (callStatus === "ringing") {
          // Evita di avviare se l'utente ha già terminato
          setCallStatus("connected")
          startTimer()
        }
      }, 8000) // Simula il tempo di connessione
    } else {
      setError(result.error || "Errore sconosciuto")
      setCallStatus("error")
    }
  }

  const handleEndCall = async () => {
    if (sessionId) {
      await endCallAction(sessionId)
    }
    stopTimer()
    setCallStatus("ended")
    const finalWallet = await getUserWalletAction(clientId)
    setWallet(finalWallet)

    setTimeout(() => {
      setCallStatus("idle")
      resetTimer()
      setCurrentCost(0)
    }, 5000)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0")
    const secs = (seconds % 60).toString().padStart(2, "0")
    return `${mins}:${secs}`
  }

  const canStartCall = callStatus === "idle" && operator.isOnline && wallet >= operator.ratePerMinute

  return (
    <Card className="w-full max-w-sm mx-auto shadow-lg">
      <CardHeader className="text-center">
        <img
          src={operator.avatar || "/placeholder.svg"}
          alt={operator.name}
          className="w-20 h-20 rounded-full mx-auto mb-2 border-2 border-primary/20"
        />
        <CardTitle>{operator.name}</CardTitle>
        <p className="text-muted-foreground">€{operator.ratePerMinute.toFixed(2)}/minuto</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <span className="font-medium">Il tuo credito:</span>
          <span className="font-bold text-lg">€{wallet.toFixed(2)}</span>
        </div>

        {(callStatus === "connected" || callStatus === "ended") && (
          <div className="text-center p-4 border rounded-lg">
            <div className="flex items-center justify-center gap-2 text-2xl font-mono mb-2">
              <Timer className="h-6 w-6" />
              <span>{formatTime(time)}</span>
            </div>
            <div className="text-sm text-muted-foreground">Costo attuale: €{currentCost.toFixed(2)}</div>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {callStatus === "ended" && !error && (
          <Alert variant="default">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>Chiamata terminata.</AlertDescription>
          </Alert>
        )}

        <div className="pt-2">
          {callStatus === "idle" && (
            <Button
              onClick={handleStartCall}
              disabled={!canStartCall}
              className="w-full bg-green-600 hover:bg-green-700"
              size="lg"
            >
              <Phone className="mr-2 h-5 w-5" /> Chiama Ora
            </Button>
          )}
          {(callStatus === "initiating" || callStatus === "ringing") && (
            <Button onClick={handleEndCall} variant="destructive" className="w-full" size="lg">
              {callStatus === "initiating" && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              {callStatus === "ringing" && <PhoneOff className="mr-2 h-5 w-5" />}
              Annulla
            </Button>
          )}
          {callStatus === "connected" && (
            <Button onClick={handleEndCall} variant="destructive" className="w-full" size="lg">
              <PhoneOff className="mr-2 h-5 w-5" /> Termina Chiamata
            </Button>
          )}
        </div>
        {!canStartCall && callStatus === "idle" && (
          <p className="text-xs text-center text-red-500 mt-2">
            {operator.isOnline ? "Credito insufficiente per avviare la chiamata." : "L'operatore non è disponibile."}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
