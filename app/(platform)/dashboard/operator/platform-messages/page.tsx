"use client"

import { useState, useEffect, useRef, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Send,
  Paperclip,
  Search,
  MessageSquare,
  Users,
  AlertTriangle,
  MessageSquareWarning,
  Loader2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useOperatorStatus } from "@/contexts/operator-status-context"
import { sendOperatorMessageAction, getConversations } from "@/lib/actions/chat.actions"
import type { Message, Conversation } from "@/types/chat.types"
import { useAuth } from "@/contexts/auth-context"

const MAX_OPERATOR_MESSAGES_PER_SESSION = 5

export default function OperatorPlatformMessagesPage() {
  const { user, loading: authLoading } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [newMessageText, setNewMessageText] = useState("")
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const { status: operatorGlobalStatus } = useOperatorStatus()

  useEffect(() => {
    if (authLoading) return
    if (user && user.role === "operator") {
      setIsLoading(true)
      getConversations(user.id, "operator")
        .then((data) => {
          setConversations(data)
          if (data.length > 0 && !selectedConversationId) {
            setSelectedConversationId(data[0].id)
          }
        })
        .finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [user, authLoading, selectedConversationId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [conversations, selectedConversationId])

  const selectedConversation = conversations.find((c) => c.id === selectedConversationId)
  const canOperatorSendMessage = selectedConversation
    ? (selectedConversation.operatorMessagesSent || 0) < MAX_OPERATOR_MESSAGES_PER_SESSION
    : false

  const handleSelectConversation = (convId: string) => {
    setSelectedConversationId(convId)
    setConversations((prev) => prev.map((c) => (c.id === convId ? { ...c, unreadMessages: 0 } : c)))
  }

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault()
    if (
      !newMessageText.trim() ||
      !selectedConversationId ||
      operatorGlobalStatus === "paused" ||
      isSending ||
      !canOperatorSendMessage ||
      !user
    ) {
      return
    }

    setIsSending(true)
    const tempMessageId = `temp_op_${Date.now()}`
    const optimisticMessage: Message = {
      id: tempMessageId,
      senderId: user.id,
      senderName: user.name || "Tu",
      text: newMessageText,
      timestamp: new Date(),
      avatar: user.avatarUrl,
    }

    setConversations((prev) =>
      prev
        .map((conv) =>
          conv.id === selectedConversationId
            ? {
                ...conv,
                messages: [...(conv.messages || []), optimisticMessage],
                lastMessage: newMessageText,
                lastMessageTimestamp: new Date(),
                operatorMessagesSent: (conv.operatorMessagesSent || 0) + 1,
              }
            : conv,
        )
        .sort((a, b) => b.lastMessageTimestamp.getTime() - a.lastMessageTimestamp.getTime()),
    )
    const messageToSend = newMessageText
    setNewMessageText("")

    const result = await sendOperatorMessageAction(
      selectedConversationId,
      messageToSend,
      user.id,
      user.name || "Operatore",
      user.avatarUrl,
    )

    if (result.success && result.message) {
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === selectedConversationId
            ? {
                ...conv,
                messages: (conv.messages || []).map((m) => (m.id === tempMessageId ? result.message! : m)),
              }
            : conv,
        ),
      )
    } else {
      console.error("Errore invio messaggio operatore:", result.error)
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === selectedConversationId
            ? {
                ...conv,
                messages: (conv.messages || []).filter((m) => m.id !== tempMessageId),
                operatorMessagesSent: (conv.operatorMessagesSent || 1) - 1,
              }
            : conv,
        ),
      )
      alert(`Errore invio: ${result.error || "Riprova più tardi."}`)
    }
    setIsSending(false)
  }

  const filteredConversations = conversations.filter((conv) =>
    conv.participantName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (isLoading || authLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    )
  }

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="text-yellow-500" /> Accesso Richiesto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Devi effettuare l'accesso come operatore per visualizzare i messaggi.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col bg-slate-50 border rounded-lg shadow-sm">
      <CardHeader className="p-4 border-b bg-white rounded-t-lg">
        <CardTitle className="text-2xl font-bold text-slate-800 flex items-center">
          <Users className="mr-2 h-6 w-6 text-purple-600" />
          Messaggi Clienti
        </CardTitle>
        <CardDescription className="text-slate-500">Comunica con i tuoi clienti.</CardDescription>
      </CardHeader>

      <div className="flex-grow grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-0 h-full overflow-hidden">
        <Card className="md:col-span-1 lg:col-span-1 rounded-none border-r border-slate-200 flex flex-col h-full bg-white">
          <CardHeader className="p-3 border-b border-slate-200">
            <div className="relative">
              <Input
                placeholder="Cerca clienti..."
                className="pl-10 rounded-md bg-slate-100 border-slate-300 focus:border-purple-500 focus:ring-purple-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            </div>
          </CardHeader>
          <ScrollArea className="flex-grow">
            <CardContent className="p-0">
              {filteredConversations.length > 0 ? (
                filteredConversations.map((chat) => (
                  <div
                    key={chat.id}
                    className={cn(
                      "flex items-center gap-3 p-3 border-b border-slate-100 hover:bg-purple-50 cursor-pointer transition-colors",
                      selectedConversationId === chat.id && "bg-purple-100 border-l-4 border-purple-500",
                    )}
                    onClick={() => handleSelectConversation(chat.id)}
                  >
                    <Avatar className="h-11 w-11 relative">
                      <AvatarImage src={chat.avatar || "/placeholder.svg"} alt={chat.participantName} />
                      <AvatarFallback className="bg-slate-200 text-slate-600">
                        {chat.participantName.substring(0, 1)}
                      </AvatarFallback>
                      {chat.isOnline && (
                        <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 ring-2 ring-white" />
                      )}
                    </Avatar>
                    <div className="flex-grow overflow-hidden">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-semibold text-slate-700 truncate">{chat.participantName}</p>
                        {chat.unreadMessages > 0 && (
                          <Badge className="ml-auto text-xs bg-purple-600 text-white font-semibold rounded-full px-1.5 py-0.5">
                            {chat.unreadMessages}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 truncate">{chat.lastMessage}</p>
                      <p className="text-[10px] text-slate-400">
                        {new Date(chat.lastMessageTimestamp).toLocaleTimeString("it-IT", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-slate-500">
                  <Users className="mx-auto h-10 w-10 text-slate-400 mb-2" />
                  Nessuna conversazione trovata.
                </div>
              )}
            </CardContent>
          </ScrollArea>
        </Card>

        <div className="md:col-span-2 lg:col-span-3 flex flex-col h-full bg-slate-100">
          {selectedConversation ? (
            <>
              <CardHeader className="p-3 border-b border-slate-200 flex flex-row items-center justify-between bg-white shadow-sm">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={selectedConversation.avatar || "/placeholder.svg"}
                      alt={selectedConversation.participantName}
                    />
                    <AvatarFallback className="bg-slate-200 text-slate-600">
                      {selectedConversation.participantName.substring(0, 1)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-md font-semibold text-slate-800">
                      {selectedConversation.participantName}
                    </CardTitle>
                    <p className={cn("text-xs", selectedConversation.isOnline ? "text-green-600" : "text-slate-500")}>
                      {selectedConversation.isOnline ? "Online" : "Offline"}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <ScrollArea className="flex-grow p-4 space-y-3 bg-slate-100">
                {(selectedConversation.messages || []).map((msg) => (
                  <div key={msg.id} className={cn("flex", msg.senderId === user.id ? "justify-end" : "justify-start")}>
                    <div className="flex items-end gap-2 max-w-[75%]">
                      {msg.senderId !== user.id && (
                        <Avatar className="h-7 w-7 mb-1">
                          <AvatarImage src={msg.avatar || "/placeholder.svg"} alt={msg.senderName} />
                          <AvatarFallback className="text-xs bg-slate-300 text-slate-700">
                            {msg.senderName.substring(0, 1)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={cn(
                          "p-2.5 rounded-lg shadow-sm text-sm",
                          msg.senderId === user.id
                            ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-br-none"
                            : "bg-white text-slate-800 border border-slate-200 rounded-bl-none",
                          msg.id.startsWith("temp_") && "opacity-70",
                        )}
                      >
                        <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                        <p
                          className={cn(
                            "text-xs mt-1",
                            msg.senderId === user.id ? "text-purple-200/80 text-right" : "text-slate-400 text-left",
                          )}
                        >
                          {new Date(msg.timestamp).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </ScrollArea>
              <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 bg-white">
                {operatorGlobalStatus === "paused" && (
                  <div className="text-center text-sm text-orange-600 bg-orange-100 p-2 rounded-md mb-2 flex items-center justify-center gap-1">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    Sei in pausa. Non puoi inviare messaggi.
                  </div>
                )}
                {!canOperatorSendMessage && operatorGlobalStatus !== "paused" && selectedConversation && (
                  <div className="text-center text-sm text-orange-700 bg-orange-100 p-2 rounded-md mb-2 flex items-center justify-center gap-2">
                    <MessageSquareWarning className="h-5 w-5 shrink-0" />
                    <span>Limite di {MAX_OPERATOR_MESSAGES_PER_SESSION} messaggi gratuiti raggiunto.</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-slate-500 hover:text-purple-600"
                    disabled={operatorGlobalStatus === "paused" || isSending || !canOperatorSendMessage}
                  >
                    <Paperclip className="h-5 w-5" />
                  </Button>
                  <Input
                    placeholder={
                      operatorGlobalStatus === "paused"
                        ? "Sei in pausa..."
                        : !canOperatorSendMessage
                          ? "Limite messaggi raggiunto"
                          : "Rispondi al cliente..."
                    }
                    className="flex-grow rounded-full px-4 py-2 border-slate-300 focus:border-purple-500 focus:ring-purple-500"
                    value={newMessageText}
                    onChange={(e) => setNewMessageText(e.target.value)}
                    disabled={isSending || operatorGlobalStatus === "paused" || !canOperatorSendMessage}
                  />
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full p-2.5 aspect-square h-auto hover:opacity-90"
                    disabled={
                      isSending ||
                      !newMessageText.trim() ||
                      operatorGlobalStatus === "paused" ||
                      !canOperatorSendMessage
                    }
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 p-8 text-center">
              <MessageSquare className="h-16 w-16 mb-4 text-slate-300" />
              <p className="text-lg font-medium">Seleziona una conversazione</p>
              <p className="text-sm">Scegli un cliente per visualizzare i messaggi.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
