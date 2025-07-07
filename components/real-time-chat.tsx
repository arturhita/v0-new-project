"use client"

import type React from "react"

import type { ChatMessage, getChatSession } from "@/types/chat.types"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Paperclip, Send, Clock, Phone, Video } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import { useTimer } from "@/hooks/use-timer"

interface RealTimeChatProps {
  initialSession: Awaited<ReturnType<typeof getChatSession>>
}

const MOCK_MESSAGES: ChatMessage[] = [
  {
    id: "1",
    sender_id: "system",
    sender_name: "System",
    content: "La sessione di chat è iniziata. Il tempo sta scorrendo.",
    timestamp: new Date().toISOString(),
    is_system_message: true,
  },
]

export function RealTimeChat({ initialSession }: RealTimeChatProps) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_MESSAGES)
  const [newMessage, setNewMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { seconds, formattedTime, isActive, start, pause } = useTimer()

  useEffect(() => {
    start()
  }, [start])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (newMessage.trim() === "" || !user) return

    const message: ChatMessage = {
      id: Date.now().toString(),
      sender_id: user.id,
      sender_name: user.name || "Tu",
      content: newMessage,
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, message])
    setNewMessage("")

    // Mock operator response
    setTimeout(() => {
      const operatorResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender_id: initialSession?.operator?.id || "operator_mock_id",
        sender_name: initialSession?.operator?.name || "Operatore",
        content: "Grazie per il tuo messaggio. Sto analizzando la tua richiesta.",
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, operatorResponse])
    }, 1500)
  }

  if (!initialSession || !user) {
    return <div>Caricamento sessione...</div>
  }

  const otherParticipant = user.id === initialSession.client_id ? initialSession.operator : initialSession.client

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-slate-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white shadow-sm">
        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarImage src={otherParticipant?.avatar_url || ""} />
            <AvatarFallback>{otherParticipant?.name?.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-bold text-lg">{otherParticipant?.name}</h2>
            <p className="text-sm text-green-500">Online</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="font-bold text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              {formattedTime}
            </div>
            <p className="text-xs text-gray-500">Durata sessione</p>
          </div>
          <Button variant="ghost" size="icon">
            <Phone className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Video className="w-5 h-5" />
          </Button>
          <Button variant="destructive" onClick={pause}>
            Termina Chat
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex items-end gap-3",
              msg.sender_id === user.id ? "justify-end" : "justify-start",
              msg.is_system_message && "justify-center",
            )}
          >
            {msg.sender_id !== user.id && !msg.is_system_message && (
              <Avatar className="w-8 h-8">
                <AvatarImage src={otherParticipant?.avatar_url || ""} />
                <AvatarFallback>{msg.sender_name.charAt(0)}</AvatarFallback>
              </Avatar>
            )}
            <div
              className={cn(
                "max-w-md lg:max-w-xl p-3 rounded-2xl",
                msg.sender_id === user.id
                  ? "bg-blue-600 text-white rounded-br-none"
                  : "bg-white text-gray-800 rounded-bl-none border",
                msg.is_system_message && "bg-gray-200 text-gray-600 text-sm text-center",
              )}
            >
              <p className="text-base">{msg.content}</p>
              {!msg.is_system_message && (
                <p className="text-xs opacity-70 mt-1 text-right">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t">
        <form onSubmit={handleSendMessage} className="flex items-center gap-4">
          <Button variant="ghost" size="icon" type="button">
            <Paperclip className="w-5 h-5 text-gray-500" />
          </Button>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Scrivi un messaggio..."
            className="flex-1 bg-slate-100 border-transparent focus:bg-white focus:border-blue-500"
            autoComplete="off"
          />
          <Button type="submit" size="icon">
            <Send className="w-5 h-5" />
          </Button>
        </form>
      </div>
    </div>
  )
}
