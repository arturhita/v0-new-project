"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Send, Timer, Coins } from "lucide-react"
import { wsManager } from "@/lib/websocket"
import { useTimer } from "@/hooks/use-timer"
import type { ChatSessionDetails, Message } from "@/types/chat.types"

interface RealTimeChatProps {
  session: ChatSessionDetails
  currentUserId: string
  currentUserName: string
  initialBalance: number
  onBalanceUpdate: (newBalance: number) => void
  onSessionEnd: () => void
}

export function RealTimeChat({
  session,
  currentUserId,
  currentUserName,
  initialBalance,
  onBalanceUpdate,
  onSessionEnd,
}: RealTimeChatProps) {
  const [messages, setMessages] = useState<Message[]>(session.messages || [])
  const [newMessage, setNewMessage] = useState("")
  const [balance, setBalance] = useState(initialBalance)
  const [isConnected, setIsConnected] = useState(false)
  const [isCallActive, setIsCallActive] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const { time, isRunning, startTimer, stopTimer } = useTimer()

  const ratePerMinute = session.operator.ratePerMinute

  useEffect(() => {
    const socket = wsManager.connect(currentUserId)
    socket.on("connect", () => setIsConnected(true))
    socket.on("disconnect", () => setIsConnected(false))
    socket.emit("join_session", { sessionId: session.id })
    socket.on("new_message", (message: Message) => {
      setMessages((prev) => [...prev, message])
    })
    socket.on("balance_update", (newBalance: number) => {
      setBalance(newBalance)
      onBalanceUpdate(newBalance)
    })
    socket.on("session_ended", () => {
      stopTimer()
      onSessionEnd()
    })

    startTimer()

    return () => {
      socket.off("new_message")
      socket.off("balance_update")
      socket.off("session_ended")
      wsManager.disconnect()
    }
  }, [session.id, currentUserId, onBalanceUpdate, onSessionEnd, startTimer, stopTimer])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    if (!isRunning || balance <= 0) return

    const interval = setInterval(() => {
      const costPerSecond = ratePerMinute / 60
      const newBalance = Math.max(0, balance - costPerSecond)

      if (newBalance <= 0) {
        wsManager.emit("end_session", {
          sessionId: session.id,
          reason: "insufficient_balance",
        })
        stopTimer()
      } else {
        setBalance(newBalance)
        onBalanceUpdate(newBalance)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning, balance, ratePerMinute, session.id, stopTimer, onBalanceUpdate])

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || balance <= 0) return

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

  const endSession = () => {
    wsManager.emit("end_session", { sessionId: session.id })
    stopTimer()
    onSessionEnd()
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
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
              {message.senderId !== currentUserId && (
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

      <form onSubmit={sendMessage} className="p-4 border-t dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={balance > 0 ? "Scrivi un messaggio..." : "Credito insufficiente"}
            disabled={balance <= 0 || !isConnected}
            className="flex-1 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 rounded-full px-4"
          />
          <Button
            type="submit"
            disabled={!newMessage.trim() || balance <= 0 || !isConnected}
            className="bg-blue-600 hover:bg-blue-700 rounded-full w-12 h-12 flex-shrink-0"
            size="icon"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </form>
    </div>
  )
}
