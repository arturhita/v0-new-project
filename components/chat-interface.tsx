"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/contexts/auth-context"
import { sendMessage } from "@/lib/actions/chat.actions"
import { useConsultationBilling } from "@/hooks/use-consultation-billing.ts"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send } from "lucide-react"
import { toast } from "sonner"

type Message = {
  id: string
  sender_id: string
  content: string
  created_at: string
}

type ConsultationDetails = {
  id: string
  client_id: string
  operator_id: string
  status: string
  start_time: string | null
  client: { full_name: string; avatar_url: string }
  operator: { full_name: string; avatar_url: string; rate_per_minute: number }
}

interface ChatInterfaceProps {
  initialConsultation: ConsultationDetails
  initialMessages: Message[]
}

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600)
    .toString()
    .padStart(2, "0")
  const m = Math.floor((seconds % 3600) / 60)
    .toString()
    .padStart(2, "0")
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0")
  return `${h}:${m}:${s}`
}

export function ChatInterface({ initialConsultation, initialMessages }: ChatInterfaceProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [messages, setMessages] = useState(initialMessages)
  const [newMessage, setNewMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const isClient = user?.id === initialConsultation.client_id
  const otherUser = isClient ? initialConsultation.operator : initialConsultation.client

  const { elapsedTime, currentCost, walletBalance, status, isEnding, handleEndConsultation } = useConsultationBilling({
    consultationId: initialConsultation.id,
    startTime: initialConsultation.start_time,
    ratePerMinute: initialConsultation.operator.rate_per_minute || 1.0,
    isClient,
    onSessionEnd: () => {
      setTimeout(() => {
        router.push(isClient ? "/dashboard/client" : "/dashboard/operator")
      }, 3000)
    },
  })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`chat:${initialConsultation.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `consultation_id=eq.${initialConsultation.id}`,
        },
        (payload) => {
          setMessages((prevMessages) => [...prevMessages, payload.new as Message])
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [initialConsultation.id])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || isSending) return

    setIsSending(true)
    const result = await sendMessage(initialConsultation.id, newMessage)
    if (result.error) {
      toast.error(result.error)
    } else {
      setNewMessage("")
    }
    setIsSending(false)
  }

  if (!user) {
    return <div>Autenticazione in corso...</div>
  }

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-gray-900/50 text-white rounded-lg shadow-2xl overflow-hidden border border-indigo-500/30">
      <header className="flex items-center justify-between p-4 bg-gray-900/80 border-b border-indigo-500/30">
        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarImage src={otherUser.avatar_url || "/placeholder.svg"} alt={otherUser.full_name} />
            <AvatarFallback>{otherUser.full_name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-bold text-lg">{otherUser.full_name}</h2>
            <p className="text-xs text-green-400">Online</p>
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono text-lg tracking-wider">{formatTime(elapsedTime)}</div>
          <div className="text-sm text-amber-400">Costo: {currentCost.toFixed(2)}€</div>
          {isClient && walletBalance !== null && (
            <div className={`text-sm ${status === "low_balance" ? "text-red-500 animate-pulse" : "text-gray-400"}`}>
              Saldo: {(walletBalance - currentCost).toFixed(2)}€
            </div>
          )}
        </div>
        <Button onClick={handleEndConsultation} disabled={isEnding} variant="destructive">
          {isEnding ? "Terminando..." : "Termina Sessione"}
        </Button>
      </header>

      <main className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-end gap-2 ${msg.sender_id === user.id ? "justify-end" : "justify-start"}`}
          >
            {msg.sender_id !== user.id && (
              <Avatar className="w-8 h-8">
                <AvatarImage src={otherUser.avatar_url || "/placeholder.svg"} />
                <AvatarFallback>{otherUser.full_name.charAt(0)}</AvatarFallback>
              </Avatar>
            )}
            <div
              className={`max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-2xl ${
                msg.sender_id === user.id ? "bg-indigo-600 rounded-br-none" : "bg-gray-700 rounded-bl-none"
              }`}
            >
              <p className="text-sm">{msg.content}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </main>

      <footer className="p-4 bg-gray-900/80 border-t border-indigo-500/30">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <Input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Scrivi un messaggio..."
            className="flex-1 bg-gray-800 border-gray-700 text-white placeholder-gray-500"
            disabled={isEnding}
          />
          <Button type="submit" disabled={isSending || isEnding} className="bg-indigo-600 hover:bg-indigo-700">
            <Send className="w-5 h-5" />
          </Button>
        </form>
      </footer>
    </div>
  )
}
