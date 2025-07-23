"use client"

import type React from "react"
import { createContext, useContext, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useAuth } from "./auth-context"
import { useRouter } from "next/navigation"

type ClientConsultationContextType = {}

const ClientConsultationContext = createContext<ClientConsultationContextType | undefined>(undefined)

export const ClientConsultationProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel(`consultation-requests-client-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "consultation_requests",
          filter: `client_id=eq.${user.id}`,
        },
        (payload) => {
          const { status, consultation_id } = payload.new as { status: string; consultation_id: string }
          if (status === "accepted" && consultation_id) {
            router.push(`/chat/${consultation_id}`)
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, supabase, router])

  return <ClientConsultationContext.Provider value={{}}>{children}</ClientConsultationContext.Provider>
}

export const useClientConsultation = () => {
  const context = useContext(ClientConsultationContext)
  if (context === undefined) {
    throw new Error("useClientConsultation must be used within a ClientConsultationProvider")
  }
  return context
}
