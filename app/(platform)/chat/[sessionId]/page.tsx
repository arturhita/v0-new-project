"use client"

import { useEffect, useState } from "react"
import { useParams, notFound } from "next/navigation"
import { getChatSessionDetails } from "@/lib/actions/chat.actions"
import { ChatSessionWindow } from "@/components/chat-session-window"
import type { ChatSessionDetails } from "@/types/chat.types"
import { Loader2 } from "lucide-react"

// Questa pagina ora è un Client Component per gestire il caricamento lato client
export default function ChatPage() {
  const params = useParams()
  const sessionId = params.sessionId as string
  const [sessionDetails, setSessionDetails] = useState<ChatSessionDetails | null | undefined>(undefined)

  useEffect(() => {
    if (!sessionId) return

    const fetchSession = async () => {
      try {
        const details = await getChatSessionDetails(sessionId)
        setSessionDetails(details)
      } catch (error) {
        console.error("Failed to fetch session details:", error)
        setSessionDetails(null) // Imposta a null in caso di errore
      }
    }

    fetchSession()
  }, [sessionId])

  // Stato di caricamento
  if (sessionDetails === undefined) {
    return (
      <div className="min-h-screen w-full bg-slate-100 dark:bg-slate-900 flex flex-col items-center justify-center p-4 text-slate-700 dark:text-slate-300">
        <Loader2 className="h-12 w-12 animate-spin mb-4" />
        <h1 className="text-2xl font-semibold">Caricamento della sessione di chat...</h1>
        <p>Un istante, stiamo preparando tutto.</p>
      </div>
    )
  }

  // Se la sessione non esiste, mostra una pagina 404
  if (sessionDetails === null) {
    notFound()
  }

  return (
    <div className="min-h-screen w-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl h-[calc(100vh-4rem)]">
        <ChatSessionWindow sessionDetails={sessionDetails} />
      </div>
    </div>
  )
}
