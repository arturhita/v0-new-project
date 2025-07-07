"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { getConversationsForOperator, sendMessage } from "@/lib/actions/chat.actions"
import { useAuth } from "@/contexts/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send } from "lucide-react"
import { format } from "date-fns"
import { it } from "date-fns/locale"

type Profile = {
  id: string
  full_name: string | null
  avatar_url: string | null
}

type Conversation = {
  id: string
  client: Profile
  last_message_at: string
}

type Message = {
  id: string
  sender_id: string
  content: string
  created_at: string
}

export default function OperatorMessagesPage() {
  const { user } = useAuth()
  const supabase = createClient()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (user) {
      const fetchConversations = async () => {
        setLoading(true)
        const result = await getConversationsForOperator(user.id)
        if (result.success && result.data) {
          setConversations(result.data as any)
        } else {
          console.error(result.error)
        }
        setLoading(false)
      }
      fetchConversations()
    }
  }, [user])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (!selectedConversation) return

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", selectedConversation.id)
        .order("created_at", { ascending: true })

      if (error) {
        console.error("Error fetching messages:", error)
      } else {
        setMessages(data as Message[])
      }
    }
    fetchMessages()

    const channel = supabase
      .channel(`messages:${selectedConversation.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${selectedConversation.id}`,
        },
        (payload) => {
          setMessages((prevMessages) => [...prevMessages, payload.new as Message])
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedConversation, supabase])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !user || !selectedConversation) return

    const content = newMessage
    setNewMessage("")

    await sendMessage({
      conversationId: selectedConversation.id,
      senderId: user.id,
      content,
    })
  }

  if (loading) {
    return <div className="p-4">Caricamento conversazioni...</div>
  }

  return (
    <div className="flex h-[calc(100vh-120px)] border rounded-lg bg-card text-card-foreground">
      <aside className="w-1/3 border-r">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold">Messaggi Clienti</h2>
        </div>
        <ScrollArea className="h-[calc(100%-65px)]">
          {conversations.length > 0 ? (
            conversations.map((convo) => (
              <div
                key={convo.id}
                className={`p-4 cursor-pointer hover:bg-muted ${selectedConversation?.id === convo.id ? "bg-muted" : ""}`}
                onClick={() => setSelectedConversation(convo)}
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={convo.client.avatar_url || undefined} />
                    <AvatarFallback>{convo.client.full_name?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <p className="font-semibold truncate">{convo.client.full_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(convo.last_message_at), "Pp", { locale: it })}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="p-4 text-muted-foreground">Nessuna conversazione trovata.</p>
          )}
        </ScrollArea>
      </aside>
      <main className="w-2/3 flex flex-col">
        {selectedConversation ? (
          <>
            <header className="p-4 border-b flex items-center gap-3">
              <Avatar>
                <AvatarImage src={selectedConversation.client.avatar_url || undefined} />
                <AvatarFallback>{selectedConversation.client.full_name?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <h3 className="text-lg font-semibold">{selectedConversation.client.full_name}</h3>
            </header>
            <ScrollArea className="flex-1 p-4 bg-background/30">
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-2 ${msg.sender_id === user?.id ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md p-3 rounded-lg ${
                        msg.sender_id === user?.id ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <p className="text-xs text-right opacity-70 mt-1">
                        {format(new Date(msg.created_at), "p", { locale: it })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            <footer className="p-4 border-t bg-card">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Scrivi un messaggio..."
                  autoComplete="off"
                />
                <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </footer>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <p>Seleziona una conversazione per iniziare a chattare.</p>
          </div>
        )}
      </main>
    </div>
  )
}
