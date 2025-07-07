"use client"

import { useEffect, useState } from "react"
import { notFound } from "next/navigation"
import { getChatSessionDetails, getChatSession } from "@/lib/actions/chat.actions"
import { RealTimeChat } from "@/components"
import type { ChatSessionDetails } from "@/types/chat.types"
import { Loader2 } from "lucide-react"

// Questa pagina ora è un Client Component per gestire il caricamento lato client
export default async function ChatPage({ params }: { params: { sessionId: string } }) {
  const [sessionDetails, setSessionDetails] = useState<ChatSessionDetails | null | undefined>(undefined)
  const sessionId = params.sessionId

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

  const session = await getChatSession(sessionId)

  if (!session) {
    notFound()
  }

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
        <RealTimeChat initialSession={session} />
      </div>
    </div>
  )
}
