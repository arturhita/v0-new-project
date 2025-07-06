"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { useAuth } from "@/contexts/auth-context"
import { createClient } from "@/lib/supabase/client"
import { useTimer } from "@/hooks/use-timer"
import {
  getChatSession,
  getChatMessages,
  postMessage,
  chargeForMinute,
  endChatSession,
} from "@/lib/actions/chat.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Send, PhoneOff, AlertTriangle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import type { Message } from "@/types/chat.types"

type SessionData = Awaited<ReturnType<typeof getChatSession>>["data"]

export default function ChatPage() {
  const { sessionId } = useParams()
  const router = useRouter()
  const { user, profile } = useAuth()
  const { toast } = useToast()
  const supabase = createClient()

  const [session, setSession] = useState<SessionData>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEnding, setIsEnding] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const handleBilling = async () => {
    if (user?.id === session?.client_id) {
      const result = await chargeForMinute(sessionId as string)
      if (!result.success) {
        toast({ title: "Errore di addebito", description: result.message, variant: "destructive" })
        stopTimer()
        handleEndChat("client_ran_out_of_funds")
      } else {
        toast({ title: "Addebito", description: "È stato addebitato 1 minuto di conversazione." })
      }
    }
  }

  const { formattedTime, startTimer, stopTimer } = useTimer(handleBilling, 60000)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(scrollToBottom, [messages])

  useEffect(() => {
    if (!sessionId) return

    const fetchSessionData = async () => {
      const sessionResult = await getChatSession(sessionId as string)
      if (sessionResult.success && sessionResult.data) {
        setSession(sessionResult.data)
        const initialMessages = await getChatMessages(sessionId as string)
        setMessages(initialMessages)
        if (sessionResult.data.status === "in_progress") {
          startTimer()
        }
      } else {
        setError(sessionResult.message || "Impossibile caricare la sessione.")
        toast({ title: "Errore", description: sessionResult.message, variant: "destructive" })
      }
      setLoading(false)
    }

    fetchSessionData()

    const channel = supabase
      .channel(`chat:${sessionId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `consultation_id=eq.${sessionId}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message])
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
      stopTimer()
    }
  }, [sessionId])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newMessage.trim() === "" || session?.status !== "in_progress") return

    const tempId = Date.now().toString()
    const tempMessage: Message = {
      id: tempId,
      consultation_id: sessionId as string,
      sender_id: user!.id,
      content: newMessage,
      created_at: new Date().toISOString(),
      is_read: false,
    }
    setMessages((prev) => [...prev, tempMessage])
    setNewMessage("")

    const result = await postMessage(sessionId as string, newMessage)
    if (!result.success) {
      toast({ title: "Errore", description: "Impossibile inviare il messaggio.", variant: "destructive" })
      setMessages((prev) => prev.filter((m) => m.id !== tempId))
    }
  }

  const handleEndChat = async (reason: "user_ended" | "client_ran_out_of_funds" | "operator_ended") => {
    setIsEnding(true)
    stopTimer()
    const result = await endChatSession(sessionId as string, reason)
    toast({ title: "Sessione Terminata", description: result.message })
    router.push(profile?.role === "operator" ? "/dashboard/operator" : "/dashboard/client")
    setIsEnding(false)
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    )
  }

  if (error) {
    return <div className="flex h-screen items-center justify-center bg-slate-900 text-red-400">{error}</div>
  }

  const otherUser = user?.id === session?.client_id ? session?.operator : session?.client

  return (
    <div className="flex h-screen flex-col bg-slate-900 text-white">
      <header className="flex items-center justify-between border-b border-gray-700 p-4">
        <div className="flex items-center gap-4">
          <Image
            src={otherUser?.profile_image_url || "/images/placeholder.svg?width=40&height=40"}
            alt={otherUser?.stage_name || otherUser?.full_name || "Utente"}
            width={40}
            height={40}
            className="rounded-full"
          />
          <div>
            <h2 className="font-bold">{otherUser?.stage_name || otherUser?.full_name}</h2>
            <p className="text-sm text-green-400">Online</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="font-mono text-lg">{formattedTime}</div>
            <div className="text-xs text-gray-400">Durata</div>
          </div>
          <Button
            onClick={() => handleEndChat(profile?.role === "operator" ? "operator_ended" : "user_ended")}
            variant="destructive"
            size="sm"
            disabled={isEnding || session?.status !== "in_progress"}
          >
            {isEnding ? <Loader2 className="h-4 w-4 animate-spin" /> : <PhoneOff className="h-4 w-4" />}
            <span className="ml-2">Termina</span>
          </Button>
        </div>
      </header>

      {session?.status !== "in_progress" && (
        <div className="bg-yellow-500/10 text-yellow-300 p-2 text-center text-sm flex items-center justify-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          Questa chat è terminata. Non è più possibile inviare messaggi.
        </div>
      )}

      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-end gap-2 ${msg.sender_id === user?.id ? "justify-end" : "justify-start"}`}
          >
            {msg.sender_id !== user?.id && (
              <Image
                src={otherUser?.profile_image_url || "/images/placeholder.svg?width=32&height=32"}
                alt="Avatar"
                width={32}
                height={32}
                className="rounded-full"
              />
            )}
            <div
              className={`max-w-xs md:max-w-md lg:max-w-lg rounded-lg px-4 py-2 ${
                msg.sender_id === user?.id
                  ? "bg-indigo-600 text-white rounded-br-none"
                  : "bg-gray-700 text-gray-200 rounded-bl-none"
              }`}
            >
              <p>{msg.content}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </main>

      <footer className="border-t border-gray-700 p-4">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Scrivi un messaggio..."
            className="flex-1 bg-gray-800 border-gray-600 text-white focus:ring-indigo-500"
            disabled={session?.status !== "in_progress"}
          />
          <Button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700"
            disabled={session?.status !== "in_progress"}
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </footer>
    </div>
  )
}
