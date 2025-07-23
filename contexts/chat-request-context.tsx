"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "./auth-context"
import IncomingChatRequestModal from "@/components/incoming-chat-request-modal"
import type { RealtimeChannel } from "@supabase/supabase-js"

interface ChatRequest {
  consultation_id: string
  client_id: string
  client_name: string
  client_avatar_url: string | null
}

interface ChatRequestContextType {
  incomingRequest: ChatRequest | null
  clearRequest: () => void
}

const ChatRequestContext = createContext<ChatRequestContextType | undefined>(undefined)

export function ChatRequestProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth()
  const supabase = createClient()
  const [incomingRequest, setIncomingRequest] = useState<ChatRequest | null>(null)

  const clearRequest = useCallback(() => {
    setIncomingRequest(null)
  }, [])

  useEffect(() => {
    if (profile?.role !== "operator") {
      return
    }

    const channel: RealtimeChannel = supabase
      .channel(`realtime:live_consultations:operator:${profile.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "live_consultations",
          filter: `operator_id=eq.${profile.id}`,
        },
        async (payload) => {
          const newConsultation = payload.new as any
          if (newConsultation.status === "requested") {
            // Fetch client details
            const { data: clientProfile, error } = await supabase
              .from("profiles")
              .select("full_name, avatar_url")
              .eq("id", newConsultation.client_id)
              .single()

            if (error) {
              console.error("Error fetching client profile for notification:", error)
              return
            }

            setIncomingRequest({
              consultation_id: newConsultation.id,
              client_id: newConsultation.client_id,
              client_name: clientProfile.full_name || "Nuovo Cliente",
              client_avatar_url: clientProfile.avatar_url,
            })
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [profile, supabase])

  return (
    <ChatRequestContext.Provider value={{ incomingRequest, clearRequest }}>
      {children}
      {incomingRequest && <IncomingChatRequestModal request={incomingRequest} onClose={clearRequest} />}
    </ChatRequestContext.Provider>
  )
}

export function useChatRequest() {
  const context = useContext(ChatRequestContext)
  if (context === undefined) {
    throw new Error("useChatRequest must be used within a ChatRequestProvider")
  }
  return context
}
