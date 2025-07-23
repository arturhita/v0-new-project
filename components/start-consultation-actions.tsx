"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { requestConsultation } from "@/lib/actions/consultation_billing.actions"
import { useAuth } from "@/contexts/auth-context"
import { Loader2, Phone, MessageSquare } from "lucide-react"
import type { OperatorWithServices } from "@/types/operator.types"

interface StartConsultationActionsProps {
  operator: OperatorWithServices
}

export function StartConsultationActions({ operator }: StartConsultationActionsProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState<"chat" | "call" | null>(null)
  const [isWaiting, setIsWaiting] = useState(false)

  const handleRequest = async (type: "chat" | "call") => {
    if (!user) {
      toast.error("Devi effettuare l'accesso per iniziare una consulenza.")
      router.push("/login")
      return
    }

    if (user.id === operator.id) {
      toast.error("Non puoi avviare una consulenza con te stesso.")
      return
    }

    setIsLoading(type)

    const result = await requestConsultation(operator.id, type)

    if (result.success) {
      toast.success("Richiesta inviata! In attesa della risposta dell'operatore...")
      setIsWaiting(true)
    } else {
      toast.error(result.error || "Si è verificato un errore sconosciuto.")
    }

    setIsLoading(null)
  }

  const chatService = operator.services.find((s) => s.service_type === "chat")
  const callService = operator.services.find((s) => s.service_type === "call")

  if (isWaiting) {
    return (
      <div className="mt-6 p-4 bg-slate-800/50 rounded-lg text-center">
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <p className="font-semibold text-slate-300">Richiesta inviata. In attesa della risposta dell'operatore...</p>
        </div>
        <p className="text-sm text-slate-400 mt-2">
          Verrai reindirizzato automaticamente alla chat non appena l'operatore accetterà.
        </p>
      </div>
    )
  }

  return (
    <div className="mt-6 space-y-4">
      {chatService && (
        <Button
          onClick={() => handleRequest("chat")}
          disabled={isLoading !== null || operator.status !== "online"}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-lg py-6 flex items-center justify-center gap-3 transition-all duration-300 transform hover:scale-105"
        >
          {isLoading === "chat" ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <>
              <MessageSquare className="h-6 w-6" />
              <span>Inizia Chat - €{chatService.rate_per_minute}/min</span>
            </>
          )}
        </Button>
      )}
      {callService && (
        <Button
          onClick={() => handleRequest("call")}
          disabled={isLoading !== null || operator.status !== "online"}
          className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold text-lg py-6 flex items-center justify-center gap-3 transition-all duration-300 transform hover:scale-105"
        >
          {isLoading === "call" ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <>
              <Phone className="h-6 w-6" />
              <span>Inizia Chiamata - €{callService.rate_per_minute}/min</span>
            </>
          )}
        </Button>
      )}
      {operator.status !== "online" && (
        <p className="text-center text-amber-400 font-medium">L'operatore non è al momento disponibile.</p>
      )}
    </div>
  )
}
