"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/contexts/auth-provider"
import { sendMessage } from "@/lib/actions/chat.actions"
import { endConsultation } from "@/lib/actions/consultation_billing.actions"
import { useTimer } from "@/hooks/use-timer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Paperclip, Send, Phone, Video, X, Loader2 } from "lucide-react"
import { toast } from "sonner"

type Message = {
  id: string
  live_consultation_id: string
  sender_id: string
  content: string
  created_at: string
}

type Participant = {
  full_name: string | null
  avatar_url: string | null
}

type Consultation = {
  id: string
  start_time: string | null
}

type ChatInterfaceProps = {
  initialConsultation: Consultation
  initialMessages: Message[]
  currentUser: { id: string }
  otherParticipant: Participant
}

export function ChatInterface({
  initialConsultation,
  initialMessages,
  currentUser,
  otherParticipant,
}: ChatInterfaceProps) {
  const supabase = createClient()
  const { profile } = useAuth()
  const router = useRouter()
  const [messages, setMessages] = useState(initialMessages)
  const [newMessage, setNewMessage] = useState("")
  const [isEnding, setIsEnding] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { time } = useTimer(
    initialConsultation.start_time ? new Date(initialConsultation.start_time).getTime() : Date.now(),
  )

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    const channel = supabase
      .channel(`chat:${initialConsultation.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `live_consultation_id=eq.${initialConsultation.id}`,
        },
        (payload) => {
          setMessages((prevMessages) => [...prevMessages, payload.new as Message])
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, initialConsultation.id])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newMessage.trim() === "") return

    const content = newMessage
    setNewMessage("")

    const { error } = await sendMessage(initialConsultation.id, content)

    if (error) {
      toast.error("Failed to send message: " + error)
      setNewMessage(content)
    }
  }

  const handleEndConsultation = async () => {
    if (isEnding) return
    setIsEnding(true)
    toast.info("Terminazione della consultazione in corso...")

    const result = await endConsultation(initialConsultation.id)

    if (result.success) {
      toast.success(result.message || "Consultazione terminata con successo!")
      setTimeout(() => {
        const redirectPath =
          profile?.role === "operator" ? "/(platform)/dashboard/operator" : "/(platform)/dashboard/client"
        router.push(redirectPath)
        router.refresh() // To ensure data is fresh on dashboard
      }, 2000)
    } else {
      toast.error(result.error || "Impossibile terminare la consultazione.")
      setIsEnding(false)
    }
  }

  const getInitials = (name: string | null) => {
    return name
      ? name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
      : "U"
  }

  return (
    <div className="flex h-full flex-col bg-slate-900 text-white">
      <header className="flex items-center justify-between border-b border-slate-700 p-4">
        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarImage src={otherParticipant.avatar_url ?? undefined} />
            <AvatarFallback>{getInitials(otherParticipant.full_name)}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-bold">{otherParticipant.full_name}</h2>
            <p className="text-sm text-green-400">Online</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="font-mono text-lg">{formatTime(time)}</div>
            <div className="text-xs text-slate-400">Durata</div>
          </div>
          <Button variant="ghost" size="icon" disabled>
            <Phone />
          </Button>
          <Button variant="ghost" size="icon" disabled>
            <Video />
          </Button>
          <Button variant="destructive" size="icon" onClick={handleEndConsultation} disabled={isEnding}>
            {isEnding ? <Loader2 className="h-4 w-4 animate-spin" /> : <X />}
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-end gap-3 ${msg.sender_id === currentUser.id ? "justify-end" : "justify-start"}`}
            >
              {msg.sender_id !== currentUser.id && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={otherParticipant.avatar_url ?? undefined} />
                  <AvatarFallback>{getInitials(otherParticipant.full_name)}</AvatarFallback>
                </Avatar>
              )}
              <div
                className={`max-w-xs rounded-lg px-4 py-2 md:max-w-md ${
                  msg.sender_id === currentUser.id ? "bg-indigo-600 text-white" : "bg-slate-700 text-slate-200"
                }`}
              >
                <p>{msg.content}</p>
              </div>
              {msg.sender_id === currentUser.id && profile && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile.avatar_url ?? undefined} />
                  <AvatarFallback>{getInitials(profile.full_name)}</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
        </div>
        <div ref={messagesEndRef} />
      </main>

      <footer className="border-t border-slate-700 bg-slate-800 p-4">
        <form onSubmit={handleSendMessage} className="flex items-center gap-4">
          <Button variant="ghost" size="icon" type="button" disabled>
            <Paperclip />
          </Button>
          <Input
            type="text"
            placeholder="Scrivi il tuo messaggio..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 border-slate-600 bg-slate-700 text-white placeholder:text-slate-400"
            autoComplete="off"
          />
          <Button type="submit" size="icon">
            <Send />
          </Button>
        </form>
      </footer>
    </div>
  )
}
