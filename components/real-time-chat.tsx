"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Send, Timer, Coins, Loader2, AlertCircle } from "lucide-react"
import { wsManager } from "@/lib/websocket"
import { useTimer } from "@/hooks/use-timer"
import type { ChatSessionDetails, Message } from "@/types/chat.types"
import { createClient } from "@/lib/supabase/client"
import { startConsultationAction, endConsultationAction } from "@/lib/actions/consultations.actions"

interface RealTimeChatProps {
  session: ChatSessionDetails
  currentUserId: string
  currentUserName: string
  initialBalance: number
  serviceId: string // Cruciale per avviare la consultazione
  onBalanceUpdate: (newBalance: number) => void
  onSessionEnd: () => void
}

export function RealTimeChat({
  session,
  currentUserId,
  currentUserName,
  initialBalance,
  serviceId,
  onBalanceUpdate,
  onSessionEnd,
}: RealTimeChatProps) {
  const [messages, setMessages] = useState<Message[]>(session.messages || [])
  const [newMessage, setNewMessage] = useState("")
  const [balance, setBalance] = useState(initialBalance)
  const [isConnected, setIsConnected] = useState(false)
  const [consultationId, setConsultationId] = useState<string | null>(null)
  const [isSessionActive, setIsSessionActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const { time, isRunning, startTimer, stopTimer } = useTimer()
  const supabase = createClient()

  // Effetto per avviare la consultazione e impostare i listener
  useEffect(() => {
    async function initializeSession() {
      const result = await startConsultationAction(currentUserId, session.operator.id, serviceId, "chat")

      if (result.success && result.consultationId) {
        setConsultationId(result.consultationId)
        setIsSessionActive(true)
        startTimer()

        // Connessione a WebSocket per i messaggi
        const socket = wsManager.connect(currentUserId)
        socket.on("connect", () => setIsConnected(true))
        socket.on("disconnect", () => setIsConnected(false))
        socket.emit("join_session", { sessionId: session.id }) // Usa session.id per la chat room
        socket.on("new_message", (message: Message) => {
          setMessages((prev) => [...prev, message])
        })
      } else {
        setError(result.error || "Impossibile avviare la sessione.")
        setIsSessionActive(false)
      }
    }

    initializeSession()

    // Cleanup della connessione WebSocket allo smontaggio del componente
    return () => {
      wsManager.disconnect()
    }
  }, [session.id, session.operator.id, serviceId, currentUserId, startTimer])

  // Effetto per i listener Realtime di Supabase (Portafoglio e Stato Consultazione)
  useEffect(() => {
    if (!consultationId) return

    // --- Listener per lo Stato della Consultazione (Terminazione Automatica) ---
    const consultationChannel = supabase
      .channel(`consultation-status-${consultationId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "consultations",
          filter: `id=eq.${consultationId}`,
        },
        (payload) => {
          if (payload.new.status === "completed") {
            stopTimer()
            setIsSessionActive(false)
            setError("Credito esaurito. La sessione è stata terminata automaticamente.")
            setMessages((prev) => [
              ...prev,
              {
                id: `sys_${Date.now()}`,
                senderId: "system",
                senderName: "System",
                text: "Credito esaurito. La sessione è stata terminata.",
                timestamp: new Date(),
                type: "system",
              },
            ])
            onSessionEnd()
          }
        },
      )
      .subscribe()

    // --- Listener per gli Aggiornamenti del Saldo del Portafoglio ---
    const walletChannel = supabase
      .channel(`wallet-updates-${currentUserId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "wallets",
          filter: `user_id=eq.${currentUserId}`,
        },
        (payload) => {
          const newBalance = payload.new.balance
          setBalance(newBalance)
          onBalanceUpdate(newBalance)
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(consultationChannel)
      supabase.removeChannel(walletChannel)
    }
  }, [consultationId, currentUserId, onBalanceUpdate, onSessionEnd, stopTimer, supabase])

  // Scroll automatico all'ultimo messaggio
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !isSessionActive || !consultationId) return

    const message: Message = {
      id: `msg_${Date.now()}`,
      senderId: currentUserId,
      senderName: currentUserName,
      text: newMessage.trim(),
      timestamp: new Date(),
      type: "text",
    }

    wsManager.emit("send_message", { sessionId: session.id, message })
    setMessages((prev) => [...prev, message])
    setNewMessage("")
  }

  const handleEndSession = async () => {
    if (!consultationId) return
    stopTimer()
    setIsSessionActive(false)
    await endConsultationAction(consultationId, "client_ended")
    onSessionEnd()
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-red-50 dark:bg-red-950/50 p-4 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-red-800 dark:text-red-200">Errore</h2>
        <p className="text-red-600 dark:text-red-300">{error}</p>
        <Button onClick={onSessionEnd} variant="destructive" className="mt-4">
          Chiudi
        </Button>
      </div>
    )
  }

  if (!consultationId && !error) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
        <h2 className="text-xl font-semibold">Avvio della sessione...</h2>
        <p className="text-slate-500">Un istante, stiamo connettendo...</p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-950">
      <div className="p-4 border-b dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <Timer className="h-5 w-5 text-blue-500" />
            <span className="font-mono font-semibold text-lg">{formatTime(time)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <Coins className="h-5 w-5 text-yellow-500" />
            <span className="font-semibold text-lg">€{balance.toFixed(2)}</span>
          </div>
        </div>
        <Badge variant={isConnected ? "default" : "destructive"}>{isConnected ? "Connesso" : "Disconnesso"}</Badge>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-end gap-2 ${message.senderId === currentUserId ? "justify-end" : "justify-start"}`}
            >
              {message.senderId !== currentUserId && message.type !== "system" && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={session.operator.avatar || "/placeholder.svg"} />
                  <AvatarFallback>{session.operator.name.charAt(0)}</AvatarFallback>
                </Avatar>
              )}
              <div
                className={`max-w-[70%] p-3 rounded-2xl ${
                  message.senderId === currentUserId
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 rounded-bl-none"
                } ${
                  message.type === "system"
                    ? "w-full max-w-full bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300 text-center text-xs italic rounded-2xl"
                    : ""
                }`}
              >
                <p className="text-sm">{message.text}</p>
                {message.type !== "system" && (
                  <p className="text-xs opacity-70 mt-1 text-right">
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={isSessionActive ? "Scrivi un messaggio..." : "Sessione terminata"}
            disabled={!isSessionActive || !isConnected}
            className="flex-1 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 rounded-full px-4"
          />
          <Button
            type="submit"
            disabled={!newMessage.trim() || !isSessionActive || !isConnected}
            className="bg-blue-600 hover:bg-blue-700 rounded-full w-12 h-12 flex-shrink-0"
            size="icon"
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
        {isSessionActive && (
          <Button onClick={handleEndSession} variant="link" size="sm" className="w-full mt-2 text-red-500">
            Termina sessione
          </Button>
        )}
      </div>
    </div>
  )
}
