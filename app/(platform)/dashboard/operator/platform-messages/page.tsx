"use client"

import { useState, useEffect, useRef, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Paperclip, Search, MessageSquare, Users, AlertTriangle, MessageSquareWarning } from "lucide-react" // Aggiunto MessageSquareWarning
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useOperatorStatus } from "@/contexts/operator-status-context"
import { sendOperatorMessageAction } from "@/lib/actions/chat.actions"
import type { Message, Conversation } from "@/types/chat.types"

const MOCK_OPERATOR_AVATAR = "/placeholder.svg?height=40&width=40"
const MAX_OPERATOR_MESSAGES_PER_SESSION = 5

const initialOperatorConversations: Conversation[] = [
  {
    id: "chat_client123_operator_elena",
    participantName: "Mario Rossi",
    participantId: "client123",
    lastMessage: "Buongiorno Dottoressa, avrei una domanda sul mio ultimo consulto.",
    lastMessageTimestamp: new Date(Date.now() - 3600 * 1000 * 1.1),
    unreadMessages: 1,
    avatar: "/placeholder.svg?height=40&width=40",
    isOnline: true,
    messages: [
      {
        id: "m1_op_chat",
        senderId: "operator_elena",
        senderName: "Dott.ssa Elena Bianchi (Tu)",
        text: "Buongiorno Mario! Come posso aiutarla oggi?",
        timestamp: new Date(Date.now() - 3600 * 1000 * 1.2),
        avatar: MOCK_OPERATOR_AVATAR,
      },
      {
        id: "m2_op_chat",
        senderId: "client123",
        senderName: "Mario Rossi",
        text: "Buongiorno Dottoressa, avrei una domanda sul mio ultimo consulto.",
        timestamp: new Date(Date.now() - 3600 * 1000 * 1.1),
        avatar: "/placeholder.svg?height=40&width=40",
      },
    ],
    operatorMessagesSent: 1, // L'operatore ha inviato 1 messaggio
  },
  {
    id: "chat_client456_operator_elena",
    participantName: "Laura Verdi",
    participantId: "client456",
    lastMessage: "Grazie per la sua disponibilità!",
    lastMessageTimestamp: new Date(Date.now() - 3600 * 1000 * 3),
    unreadMessages: 0,
    avatar: "/placeholder.svg?height=40&width=40",
    isOnline: false,
    messages: [
      {
        id: "m3_op_chat",
        senderId: "client456",
        senderName: "Laura Verdi",
        text: "Salve, vorrei prenotare un consulto per la prossima settimana.",
        timestamp: new Date(Date.now() - 3600 * 1000 * 3.1),
        avatar: "/placeholder.svg?height=40&width=40",
      },
      {
        id: "m4_op_chat",
        senderId: "operator_elena",
        senderName: "Dott.ssa Elena Bianchi (Tu)",
        text: "Buongiorno Laura, certo. Quando preferirebbe?",
        timestamp: new Date(Date.now() - 3600 * 1000 * 3.05),
        avatar: MOCK_OPERATOR_AVATAR,
      },
      {
        id: "m5_op_chat",
        senderId: "client456",
        senderName: "Laura Verdi",
        text: "Grazie per la sua disponibilità!",
        timestamp: new Date(Date.now() - 3600 * 1000 * 3),
        avatar: "/placeholder.svg?height=40&width=40",
      },
    ],
    operatorMessagesSent: 1, // L'operatore ha inviato 1 messaggio
  },
  {
    id: "chat_client789_operator_elena",
    participantName: "Giovanni Blu",
    participantId: "client789",
    lastMessage: "Ok, grazie!",
    lastMessageTimestamp: new Date(Date.now() - 3600 * 1000 * 5),
    unreadMessages: 0,
    avatar: "/placeholder.svg?height=40&width=40",
    isOnline: true,
    messages: [
      {
        id: "m6_op_chat",
        senderId: "operator_elena",
        senderName: "Dott.ssa Elena Bianchi (Tu)",
        text: "Msg 1",
        timestamp: new Date(Date.now() - 3600 * 1000 * 5.5),
        avatar: MOCK_OPERATOR_AVATAR,
      },
      {
        id: "m7_op_chat",
        senderId: "operator_elena",
        senderName: "Dott.ssa Elena Bianchi (Tu)",
        text: "Msg 2",
        timestamp: new Date(Date.now() - 3600 * 1000 * 5.4),
        avatar: MOCK_OPERATOR_AVATAR,
      },
      {
        id: "m8_op_chat",
        senderId: "operator_elena",
        senderName: "Dott.ssa Elena Bianchi (Tu)",
        text: "Msg 3",
        timestamp: new Date(Date.now() - 3600 * 1000 * 5.3),
        avatar: MOCK_OPERATOR_AVATAR,
      },
      {
        id: "m9_op_chat",
        senderId: "operator_elena",
        senderName: "Dott.ssa Elena Bianchi (Tu)",
        text: "Msg 4",
        timestamp: new Date(Date.now() - 3600 * 1000 * 5.2),
        avatar: MOCK_OPERATOR_AVATAR,
      },
      {
        id: "m10_op_chat",
        senderId: "operator_elena",
        senderName: "Dott.ssa Elena Bianchi (Tu)",
        text: "Msg 5",
        timestamp: new Date(Date.now() - 3600 * 1000 * 5.1),
        avatar: MOCK_OPERATOR_AVATAR,
      },
      {
        id: "m11_op_chat",
        senderId: "client789",
        senderName: "Giovanni Blu",
        text: "Ok, grazie!",
        timestamp: new Date(Date.now() - 3600 * 1000 * 5),
        avatar: "/placeholder.svg?height=40&width=40",
      },
    ],
    operatorMessagesSent: 5, // L'operatore ha inviato 5 messaggi (limite raggiunto)
  },
]

export default function OperatorPlatformMessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>(initialOperatorConversations)
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(
    initialOperatorConversations.length > 0 ? initialOperatorConversations[0].id : null,
  )
  const [newMessageText, setNewMessageText] = useState("")
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const { operatorName: currentOperatorNameFromContext, status: operatorGlobalStatus } = useOperatorStatus()

  const currentOperatorId = `operator_${currentOperatorNameFromContext.toLowerCase().replace(/\W+/g, "_") || "default"}`
  const currentOperatorDisplayName = `${currentOperatorNameFromContext || "Operatore"} (Tu)`

  const selectedConversation = conversations.find((c) => c.id === selectedConversationId)

  const canOperatorSendMessage = selectedConversation
    ? selectedConversation.operatorMessagesSent < MAX_OPERATOR_MESSAGES_PER_SESSION
    : false

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [selectedConversation?.messages, isSending])

  useEffect(() => {
    if (!selectedConversationId) return

    const interval = setInterval(() => {
      const currentConv = conversations.find((c) => c.id === selectedConversationId)
      if (!currentConv) return

      const shouldSimulateMessage = Math.random() < 0.15
      if (shouldSimulateMessage) {
        const incomingMessage: Message = {
          id: `msg_client_incoming_${Date.now()}`,
          senderId: currentConv.participantId,
          senderName: currentConv.participantName,
          text: `Messaggio simulato da ${currentConv.participantName} ${Date.now() % 1000}`,
          timestamp: new Date(),
          avatar: currentConv.avatar,
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
                : conv,
            )
            .sort((a, b) => b.lastMessageTimestamp.getTime() - a.lastMessageTimestamp.getTime()),
        )
      }
    }, 7000)
    return () => clearInterval(interval)
  }, [selectedConversationId, conversations])

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
      !canOperatorSendMessage // Verifica il limite
    ) {
      return
    }

    setIsSending(true)
    const tempMessageId = `temp_op_${Date.now()}`
    const optimisticMessage: Message = {
      id: tempMessageId,
      senderId: currentOperatorId,
      senderName: currentOperatorDisplayName,
      text: newMessageText,
      timestamp: new Date(),
      avatar: MOCK_OPERATOR_AVATAR,
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
                operatorMessagesSent: conv.operatorMessagesSent + 1, // Incrementa il contatore
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
      currentOperatorId,
      currentOperatorDisplayName,
      MOCK_OPERATOR_AVATAR,
    )

    if (result.success && result.message) {
      setConversations((prev) =>
        prev
          .map((conv) =>
            conv.id === selectedConversationId
              ? {
                  ...conv,
                  messages: conv.messages.map((m) => (m.id === tempMessageId ? result.message! : m)),
                  // operatorMessagesSent è già stato incrementato ottimisticamente
                }
              : conv,
          )
          .sort((a, b) => b.lastMessageTimestamp.getTime() - a.lastMessageTimestamp.getTime()),
      )
    } else {
      console.error("Errore invio messaggio operatore:", result.error)
      // Rollback del contatore e del messaggio in caso di errore
      setConversations((prev) =>
        prev
          .map((conv) =>
            conv.id === selectedConversationId
              ? {
                  ...conv,
                  messages: conv.messages.filter((m) => m.id !== tempMessageId),
                  operatorMessagesSent: conv.operatorMessagesSent - 1, // Decrementa se l'invio fallisce
                }
              : conv,
          )
          .sort((a, b) => b.lastMessageTimestamp.getTime() - a.lastMessageTimestamp.getTime()),
      )
      alert(`Errore invio: ${result.error || "Riprova più tardi."}`)
    }
    setIsSending(false)
  }

  const filteredConversations = conversations.filter((conv) =>
    conv.participantName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col bg-slate-50">
      <CardHeader className="p-4 border-b bg-white">
        <CardTitle className="text-2xl font-bold text-slate-800 flex items-center">
          <Users className="mr-2 h-6 w-6 text-indigo-600" />
          Messaggi Clienti
        </CardTitle>
        <CardDescription className="text-slate-500">
          Comunica con i tuoi clienti. {currentOperatorDisplayName}
        </CardDescription>
      </CardHeader>

      <div className="flex-grow grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-0 h-full overflow-hidden">
        <Card className="md:col-span-1 lg:col-span-1 rounded-none border-r border-slate-200 flex flex-col h-full bg-white">
          <CardHeader className="p-3 border-b border-slate-200">
            <div className="relative">
              <Input
                placeholder="Cerca clienti..."
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
                  Nessuna conversazione con i clienti.
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
                    <p className="text-xs text-green-600">{selectedConversation.isOnline ? "Online" : "Offline"}</p>
                  </div>
                </div>
              </CardHeader>
              <ScrollArea className="flex-grow p-4 space-y-3 bg-slate-100">
                {selectedConversation.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn("flex", msg.senderId === currentOperatorId ? "justify-end" : "justify-start")}
                  >
                    <div className="flex items-end gap-2 max-w-[75%]">
                      {msg.senderId !== currentOperatorId && msg.avatar && (
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
                          msg.senderId === currentOperatorId
                            ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-br-none"
                            : "bg-white text-slate-800 border border-slate-200 rounded-bl-none",
                          msg.id.startsWith("temp_op_") && "opacity-70",
                        )}
                      >
                        <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                        <p
                          className={cn(
                            "text-xs mt-1",
                            msg.senderId === currentOperatorId
                              ? "text-indigo-200/80 text-right"
                              : "text-slate-400 text-left",
                          )}
                        >
                          {new Date(msg.timestamp).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      {msg.senderId === currentOperatorId && MOCK_OPERATOR_AVATAR && (
                        <Avatar className="h-7 w-7 mb-1">
                          <AvatarImage
                            src={MOCK_OPERATOR_AVATAR || "/placeholder.svg"}
                            alt={currentOperatorDisplayName}
                          />
                          <AvatarFallback className="text-xs bg-indigo-200 text-indigo-700">
                            {currentOperatorDisplayName.substring(0, 1)}
                          </AvatarFallback>
                        </Avatar>
                      )}
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
                    <span>
                      Limite di {MAX_OPERATOR_MESSAGES_PER_SESSION} messaggi gratuiti raggiunto. Invita l'utente a un
                      nuovo consulto.
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-slate-500 hover:text-indigo-600"
                    aria-label="Allega file"
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
                    className="flex-grow rounded-full px-4 py-2 border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                    value={newMessageText}
                    onChange={(e) => setNewMessageText(e.target.value)}
                    disabled={isSending || operatorGlobalStatus === "paused" || !canOperatorSendMessage}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage(e as unknown as FormEvent)
                      }
                    }}
                  />
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full p-2.5 aspect-square h-auto hover:opacity-90 transition-opacity"
                    disabled={
                      isSending ||
                      !newMessageText.trim() ||
                      operatorGlobalStatus === "paused" ||
                      !canOperatorSendMessage
                    }
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
                Scegli un cliente dalla lista a sinistra per visualizzare i messaggi e rispondere.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
