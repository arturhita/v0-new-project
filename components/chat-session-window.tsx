"use client"

import { useRef } from "react"

import { useState } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { X, Minimize2, Maximize2, Phone, Video, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { RealTimeChat } from "./real-time-chat"
import type { ChatSessionDetails } from "@/types/chat.types"
import { useAuth } from "@/contexts/auth-context"

// Emoji predefinite per quick access
const quickEmojis = [
  { emoji: "😊", label: "Sorriso" },
  { emoji: "👍", label: "Pollice su" },
  { emoji: "❤️", label: "Cuore" },
  { emoji: "⭐", label: "Stella" },
  { emoji: "☕", label: "Caffè" },
  { emoji: "🔥", label: "Fuoco" },
  { emoji: "⚡", label: "Fulmine" },
  { emoji: "✨", label: "Scintille" },
  { emoji: "🎯", label: "Bersaglio" },
  { emoji: "💡", label: "Lampadina" },
  { emoji: "🚀", label: "Razzo" },
  { emoji: "💎", label: "Diamante" },
]

const allEmojis = [
  ...quickEmojis,
  { emoji: "😀", label: "Felice" },
  { emoji: "😂", label: "Risata" },
  { emoji: "🤔", label: "Pensieroso" },
  { emoji: "😍", label: "Innamorato" },
  { emoji: "🎉", label: "Festa" },
  { emoji: "👏", label: "Applauso" },
  { emoji: "🙏", label: "Preghiera" },
  { emoji: "💪", label: "Forza" },
  { emoji: "🤝", label: "Stretta di mano" },
  { emoji: "👌", label: "OK" },
  { emoji: "✌️", label: "Pace" },
  { emoji: "🤞", label: "Dita incrociate" },
]

interface Message {
  id: string
  senderId: string
  text: string
  timestamp: number
  type?: "text" | "emoji"
}

interface ChatSessionWindowProps {
  sessionDetails: ChatSessionDetails
}

export function ChatSessionWindow({ sessionDetails }: ChatSessionWindowProps) {
  const router = useRouter()
  const { user } = useAuth() // Ottieni l'utente corrente
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const [isMinimized, setIsMinimized] = useState(false)

  // Determina chi è l'interlocutore
  const otherParty = user?.id === sessionDetails.client.id ? sessionDetails.operator : sessionDetails.client

  const handleClose = () => {
    // Qui andrebbe una logica per terminare la sessione (es. server action)
    console.log(`Chat session ${sessionDetails.id} closed.`)
    router.push("/dashboard/client/consultations")
  }

  if (!user) {
    // Gestisci il caso in cui l'utente non sia ancora caricato o non sia loggato
    return <div>Caricamento...</div>
  }

  return (
    <div
      className={cn(
        "fixed inset-0 bg-gradient-to-br from-slate-900/95 via-slate-800/90 to-indigo-900/95 backdrop-blur-xl flex items-center justify-center p-4 z-50 transition-all duration-500",
        isMinimized ? "opacity-0 pointer-events-none" : "opacity-100",
      )}
    >
      {/* Effetti di sfondo animati */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-sky-400/20 to-cyan-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-sky-400/10 to-indigo-400/10 rounded-full blur-3xl animate-spin-slow"></div>
      </div>

      <Card
        className={cn(
          "relative w-full max-w-4xl h-[90vh] max-h-[800px] flex flex-col shadow-2xl rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-slate-800/90 via-slate-700/80 to-indigo-800/90 backdrop-blur-2xl text-white transform transition-all duration-500 hover:shadow-indigo-500/25 hover:shadow-3xl",
          isMinimized ? "scale-95 opacity-0" : "scale-100 opacity-100",
        )}
      >
        {/* Header con gradiente */}
        <CardHeader className="flex flex-row items-center justify-between p-4 border-b dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12 border-2 border-slate-300 dark:border-slate-700">
              <AvatarImage src={otherParty.avatar || "/placeholder.svg"} />
              <AvatarFallback>{otherParty.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-100">{otherParty.name}</CardTitle>
              <p className="text-sm text-green-600 dark:text-green-500 font-medium">Online</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
            >
              <Phone className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
            >
              <Video className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
            >
              <Info className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-500"
            >
              <X className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-all duration-300 hover:scale-110"
              onClick={() => setIsMinimized(true)}
            >
              <Minimize2 className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0 flex-1">
          <RealTimeChat
            session={sessionDetails}
            currentUserId={user.id}
            currentUserName={user.name}
            initialBalance={sessionDetails.client.initialBalance}
            onBalanceUpdate={(newBalance) => console.log("Balance updated:", newBalance)}
            onSessionEnd={handleClose}
          />
        </CardContent>
        {/* Quick Emoji Bar */}
        <div className="px-6 py-2 border-t border-indigo-500/20">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <span className="text-xs text-slate-400 whitespace-nowrap mr-2">Quick:</span>
            {quickEmojis.map((item, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-lg hover:bg-white/10 hover:scale-125 transition-all duration-300 rounded-full flex-shrink-0"
                onClick={() => console.log("Invio emoji rapida:", item.emoji)}
                disabled={sessionDetails.client.initialBalance <= 0}
                title={item.label}
              >
                {item.emoji}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Pulsante per ripristinare la chat se minimizzata */}
      {isMinimized && (
        <Button
          className="fixed bottom-6 right-6 rounded-2xl shadow-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white animate-bounce shadow-cyan-500/50 hover:shadow-cyan-400/60 transition-all duration-300 hover:scale-110"
          onClick={() => setIsMinimized(false)}
          size="lg"
        >
          <Maximize2 className="h-5 w-5 mr-2" />
          Apri Chat ({otherParty.name})
        </Button>
      )}
    </div>
  )
}
