"use client"

import { useState, useEffect, useRef, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Paperclip, Search, MessageSquare, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { sendMessageAction } from "@/lib/actions/chat.actions" // Importa la Server Action
import type { Conversation, Message } from "@/types/chat.types" // Importa i tipi

// Mock user, in a real app this would come from authentication context
const MOCK_CURRENT_USER_ID = "client123"
const MOCK_CURRENT_USER_NAME = "Mario Rossi (Tu)"
const MOCK_CURRENT_USER_AVATAR = "/placeholder.svg?height=40&width=40"

// Mock initial conversations - in a real app, this would be fetched
const initialConversations: Conversation[] = [
  {
    id: "chat_elena_bianchi",
    participantName: "Dott.ssa Elena Bianchi",
    participantId: "operator_elena",
    lastMessage: "Certamente, possiamo discuterne...",
    lastMessageTimestamp: new Date(Date.now() - 3600 * 1000 * 1), // 1 ora fa
    unreadMessages: 2,
    avatar: "/placeholder.svg?height=40&width=40",
    isOnline: true,
    messages: [
      {
        id: "m1",
        senderId: "operator_elena",
        senderName: "Dott.ssa Elena Bianchi",
        text: "Buongiorno! Come posso aiutarla oggi?",
        timestamp: new Date(Date.now() - 3600 * 1000 * 1.2),
        avatar: "/placeholder.svg?height=40&width=40",
      },
      {
        id: "m2",
        senderId: MOCK_CURRENT_USER_ID,
        senderName: MOCK_CURRENT_USER_NAME,
        text: "Buongiorno Dottoressa, avrei una domanda sul mio ultimo consulto.",
        timestamp: new Date(Date.now() - 3600 * 1000 * 1.1),
        avatar: MOCK_CURRENT_USER_AVATAR,
      },
      {
        id: "m3",
        senderId: "operator_elena",
        senderName: "Dott.ssa Elena Bianchi",
        text: "Certamente, possiamo discuterne...",
        timestamp: new Date(Date.now() - 3600 * 1000 * 1),
        avatar: "/placeholder.svg?height=40&width=40",
      },
    ],
  },
  {
    id: "chat_marco_rossetti",
    participantName: "Avv. Marco Rossetti",
    participantId: "operator_marco",
    lastMessage: "Le invio i documenti a breve.",
    lastMessageTimestamp: new Date(Date.now() - 3600 * 1000 * 24 * 2), // 2 giorni fa
    unreadMessages: 0,
    avatar: "/placeholder.svg?height=40&width=40",
    isOnline: false,
    messages: [
      {
        id: "m4",
        senderId: MOCK_CURRENT_USER_ID,
        senderName: MOCK_CURRENT_USER_NAME,
        text: "Avvocato, ha novità riguardo la mia pratica?",
        timestamp: new Date(Date.now() - 3600 * 1000 * 24 * 2.1),
        avatar: MOCK_CURRENT_USER_AVATAR,
      },
      {
        id: "m5",
        senderId: "operator_marco",
        senderName: "Avv. Marco Rossetti",
        text: "Le invio i documenti a breve.",
        timestamp: new Date(Date.now() - 3600 * 1000 * 24 * 2),
        avatar: "/placeholder.svg?height=40&width=40",
      },
    ],
  },
  {
    id: "chat_supporto",
    participantName: "Supporto Piattaforma",
    participantId: "system_support",
    lastMessage: "Il suo ticket è stato aggiornato.",
    lastMessageTimestamp: new Date(Date.now() - 3600 * 1000 * 5), // 5 ore fa
    unreadMessages: 1,
    avatar: "/placeholder.svg?height=40&width=40",
    isOnline: true,
    messages: [
      {
        id: "m6",
        senderId: "system_support",
        senderName: "Supporto Piattaforma",
        text: "Il suo ticket è stato aggiornato.",
        timestamp: new Date(Date.now() - 3600 * 1000 * 5),
        avatar: "/placeholder.svg?height=40&width=40",
      },
    ],
  },
]

export default function ClientMessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations)
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(
    initialConversations.length > 0 ? initialConversations[0].id : null,
  )
  const [newMessageText, setNewMessageText] = useState("")
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const currentUserId = MOCK_CURRENT_USER_ID
  const currentUserName = MOCK_CURRENT_USER_NAME
  const currentUserAvatar = MOCK_CURRENT_USER_AVATAR

  const selectedConversation = conversations.find((c) => c.id === selectedConversationId)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [selectedConversation?.messages])

  useEffect(() => {
    if (!selectedConversationId) return

    const interval = setInterval(() => {
      const shouldSimulateMessage = Math.random() < 0.15
      if (shouldSimulateMessage && selectedConversation && selectedConversation.participantId !== "system_support") {
        const incomingMessage: Message = {
          id: `msg_incoming_${Date.now()}`,
          senderId: selectedConversation.participantId,
          senderName: selectedConversation.participantName,
          text: `Messaggio simulato da ${selectedConversation.participantName} ${Date.now() % 100}`,
          timestamp: new Date(),
          avatar: selectedConversation.avatar,
        }

        setConversations((prev) =>
          prev
            .map((conv) =>
              conv.id === selectedConversationId
                ? {
                    ...conv,
                    messages: [...conv.messages, incomingMessage],
                    lastMessage: incomingMessage.text,
                    lastMessageTimestamp: incomingMessage.timestamp,
                    unreadMessages: conv.id === selectedConversationId ? 0 : conv.unreadMessages + 1,
                  }
                : conv.id === incomingMessage.senderId && conv.id !== selectedConversationId // Se la chat non è selezionata ma è del mittente
                  ? {
                      ...conv,
                      unreadMessages: conv.unreadMessages + 1,
                      lastMessage: incomingMessage.text,
                      lastMessageTimestamp: incomingMessage.timestamp,
                    }
                  : conv,
            )
            .sort((a, b) => b.lastMessageTimestamp.getTime() - a.lastMessageTimestamp.getTime()),
        )
      }
    }, 7000)

    return () => clearInterval(interval)
  }, [selectedConversationId, selectedConversation])

  const handleSelectConversation = (convId: string) => {
    setSelectedConversationId(convId)
    setConversations((prev) => prev.map((c) => (c.id === convId ? { ...c, unreadMessages: 0 } : c)))
  }

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault()
    if (!newMessageText.trim() || !selectedConversationId) return

    setIsSending(true)

    const tempMessageId = `temp_${Date.now()}`
    const optimisticMessage: Message = {
      id: tempMessageId,
      senderId: currentUserId,
      senderName: currentUserName,
      text: newMessageText,
      timestamp: new Date(),
      avatar: currentUserAvatar,
    }

    setConversations((prev) =>
      prev
        .map((conv) =>
          conv.id === selectedConversationId
            ? {
                ...conv,
                messages: [...conv.messages, optimisticMessage],
                lastMessage: newMessageText,
                lastMessageTimestamp: new Date(),
              }
            : conv,
        )
        .sort((a, b) => b.lastMessageTimestamp.getTime() - a.lastMessageTimestamp.getTime()),
    )
    const messageToSend = newMessageText
    setNewMessageText("")

    const result = await sendMessageAction(
      selectedConversationId,
      messageToSend,
      currentUserId,
      currentUserName,
      currentUserAvatar,
    )

    if (result.success && result.message) {
      setConversations((prev) =>
        prev
          .map((conv) =>
            conv.id === selectedConversationId
              ? {
                  ...conv,
                  messages: conv.messages.map((m) => (m.id === tempMessageId ? result.message! : m)),
                }
              : conv,
          )
          .sort((a, b) => b.lastMessageTimestamp.getTime() - a.lastMessageTimestamp.getTime()),
      )
    } else {
      console.error("Errore invio messaggio:", result.error)
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === selectedConversationId
            ? {
                ...conv,
                messages: conv.messages.filter((m) => m.id !== tempMessageId),
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
  // L'ordinamento ora avviene direttamente quando si aggiorna `conversations`

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col bg-slate-50">
      <CardHeader className="p-4 border-b bg-white">
        <CardTitle className="text-2xl font-bold text-slate-800 flex items-center">
          <MessageSquare className="mr-2 h-6 w-6 text-indigo-600" />
          Centro Messaggi
        </CardTitle>
        <CardDescription className="text-slate-500">Comunica con gli operatori e il supporto.</CardDescription>
      </CardHeader>
      <div className="flex-grow grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-0 h-full overflow-hidden">
        <Card className="md:col-span-1 lg:col-span-1 rounded-none border-r border-slate-200 flex flex-col h-full bg-white">
          <CardHeader className="p-3 border-b border-slate-200">
            <div className="relative">
              <Input
                placeholder="Cerca chat..."
                className="pl-10 rounded-md bg-slate-100 border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
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
                      "flex items-center gap-3 p-3 border-b border-slate-100 hover:bg-indigo-50 cursor-pointer transition-colors",
                      selectedConversationId === chat.id && "bg-indigo-100 border-l-4 border-indigo-500",
                    )}
                    onClick={() => handleSelectConversation(chat.id)}
                  >
                    <Avatar className="h-11 w-11 relative">
                      <AvatarImage
                        src={chat.avatar || "/placeholder.svg?height=40&width=40&query=Avatar"}
                        alt={chat.participantName}
                      />
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
                          <Badge className="ml-auto text-xs bg-indigo-600 text-white font-semibold rounded-full px-1.5 py-0.5">
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
                        {" - "}
                        {new Date(chat.lastMessageTimestamp).toLocaleDateString("it-IT", {
                          day: "2-digit",
                          month: "short",
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
                      src={selectedConversation.avatar || "/placeholder.svg?height=40&width=40&query=Avatar"}
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
                {selectedConversation.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn("flex", msg.senderId === currentUserId ? "justify-end" : "justify-start")}
                  >
                    <div className="flex items-end gap-2 max-w-[75%]">
                      {msg.senderId !== currentUserId && (
                        <Avatar className="h-7 w-7 mb-1">
                          <AvatarImage
                            src={msg.avatar || "/placeholder.svg?height=40&width=40&query=Avatar"}
                            alt={msg.senderName}
                          />
                          <AvatarFallback className="text-xs bg-slate-300 text-slate-700">
                            {msg.senderName.substring(0, 1)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={cn(
                          "p-2.5 rounded-lg shadow-sm text-sm",
                          msg.senderId === currentUserId
                            ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-br-none"
                            : "bg-white text-slate-800 border border-slate-200 rounded-bl-none",
                          msg.id.startsWith("temp_") && "opacity-70",
                        )}
                      >
                        <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                        <p
                          className={cn(
                            "text-xs mt-1",
                            msg.senderId === currentUserId
                              ? "text-indigo-200/80 text-right"
                              : "text-slate-400 text-left",
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
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-slate-500 hover:text-indigo-600"
                    aria-label="Allega file"
                  >
                    <Paperclip className="h-5 w-5" />
                  </Button>
                  <Input
                    placeholder="Scrivi un messaggio..."
                    className="flex-grow rounded-full px-4 py-2 border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                    value={newMessageText}
                    onChange={(e) => setNewMessageText(e.target.value)}
                    disabled={isSending}
                  />
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full p-2.5 aspect-square h-auto hover:opacity-90 transition-opacity"
                    disabled={isSending || !newMessageText.trim()}
                    aria-label="Invia messaggio"
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
              <p className="text-sm">
                Scegli un utente dalla lista a sinistra per visualizzare i messaggi e rispondere.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
