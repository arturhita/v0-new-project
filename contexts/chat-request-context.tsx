"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback, useMemo } from "react"
import { respondToChatRequest } from "@/lib/actions/chat.actions"
import { toast } from "@/components/ui/use-toast"

interface ChatRequest {
  sessionId: string
  fromUserId: string
  fromUserName: string
}

interface ChatRequestContextType {
  request: ChatRequest | null
  isVisible: boolean
  showRequest: (request: ChatRequest) => void
  accept: () => void
  decline: () => void
}

const ChatRequestContext = createContext<ChatRequestContextType | undefined>(undefined)

export function ChatRequestProvider({ children }: { children: React.ReactNode }) {
  const [request, setRequest] = useState<ChatRequest | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  const showRequest = useCallback((newRequest: ChatRequest) => {
    setRequest(newRequest)
    setIsVisible(true)
  }, [])

  const hideRequest = useCallback(() => {
    setIsVisible(false)
    setRequest(null)
  }, [])

  const accept = useCallback(async () => {
    if (!request) return
    toast({ title: "Richiesta Accettata", description: `Stai per avviare la chat con ${request.fromUserName}.` })
    // In un'app reale, qui si aprirebbe la finestra di chat per l'operatore
    // window.open(`/dashboard/operator/chat/${request.sessionId}`, '_blank');
    console.log("Chat accettata, sessione:", request.sessionId)
    await respondToChatRequest(request.sessionId, "accepted")
    hideRequest()
  }, [request, hideRequest])

  const decline = useCallback(async () => {
    if (!request) return
    toast({ title: "Richiesta Rifiutata", variant: "destructive" })
    await respondToChatRequest(request.sessionId, "declined")
    hideRequest()
  }, [request, hideRequest])

  const value = useMemo(
    () => ({ request, isVisible, showRequest, accept, decline }),
    [request, isVisible, showRequest, accept, decline],
  )

  return <ChatRequestContext.Provider value={value}>{children}</ChatRequestContext.Provider>
}

export function useChatRequest() {
  const context = useContext(ChatRequestContext)
  if (context === undefined) {
    throw new Error("useChatRequest must be used within a ChatRequestProvider")
  }
  return context
}
