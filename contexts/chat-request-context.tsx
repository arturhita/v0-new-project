"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "./auth-context"
import { useRouter } from "next/navigation"
import { respondToChatRequest } from "@/lib/actions/chat.actions"
import { toast } from "sonner"

interface ChatRequest {
  id: string
  client_id: string
  operator_id: string
  status: "pending" | "accepted" | "rejected"
  created_at: string
  client_profile: {
    full_name: string
    avatar_url: string
  }
}

interface ChatRequestContextType {
  incomingRequest: ChatRequest | null
  setIncomingRequest: (request: ChatRequest | null) => void
  respondToRequest: (accepted: boolean) => Promise<void>
  isResponding: boolean
}

const ChatRequestContext = createContext<ChatRequestContextType | undefined>(undefined)

export function ChatRequestProvider({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth()
  const router = useRouter()
  const [incomingRequest, setIncomingRequest] = useState<ChatRequest | null>(null)
  const [isResponding, setIsResponding] = useState(false)

  const respondToRequest = useCallback(
    async (accepted: boolean) => {
      if (!incomingRequest) return
      setIsResponding(true)
      const toastId = toast.loading(accepted ? "Accettando la richiesta..." : "Rifiutando la richiesta...")

      const result = await respondToChatRequest(incomingRequest.id, accepted)

      if (result.error) {
        toast.error(result.error, { id: toastId })
      } else {
        if (accepted && result.consultationId) {
          toast.success("Richiesta accettata! Verrai reindirizzato alla chat.", { id: toastId })
          router.push(`/chat/${result.consultationId}`)
        } else {
          toast.info("Richiesta rifiutata.", { id: toastId })
        }
        setIncomingRequest(null) // Close the modal
      }
      setIsResponding(false)
    },
    [incomingRequest, router],
  )

  useEffect(() => {
    if (profile?.role !== "operator") return

    const supabase = createClient()
    const channel = supabase
      .channel("public:chat_requests")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_requests",
          filter: `operator_id=eq.${profile.id}`,
        },
        async (payload) => {
          const newRequest = payload.new as Omit<ChatRequest, "client_profile">
          if (newRequest.status === "pending") {
            // Fetch client profile
            const { data: clientProfile, error } = await supabase
              .from("profiles")
              .select("full_name, avatar_url")
              .eq("id", newRequest.client_id)
              .single()

            if (error) {
              console.error("Error fetching client profile for chat request:", error)
              return
            }

            setIncomingRequest({
              ...newRequest,
              client_profile: clientProfile,
            })
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [profile])

  return (
    <ChatRequestContext.Provider value={{ incomingRequest, setIncomingRequest, respondToRequest, isResponding }}>
      {children}
    </ChatRequestContext.Provider>
  )
}

export const useChatRequest = () => {
  const context = useContext(ChatRequestContext)
  if (context === undefined) {
    throw new Error("useChatRequest must be used within a ChatRequestProvider")
  }
  return context
}
