"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { MessageCircle, Phone, Loader2, Send } from "lucide-react"
import { requestConsultation } from "@/lib/actions/consultation_billing.actions"
import type { OperatorProfile } from "@/types/operator.types"

interface StartConsultationActionsProps {
  operator: OperatorProfile
}

export default function StartConsultationActions({ operator }: StartConsultationActionsProps) {
  const [isPending, startTransition] = useTransition()
  const [targetService, setTargetService] = useState<"chat" | "call" | null>(null)
  const router = useRouter()

  const handleStartConsultation = (serviceType: "chat" | "call") => {
    setTargetService(serviceType)
    startTransition(async () => {
      const result = await requestConsultation(operator.id, serviceType)

      if (result.success && result.data?.live_consultation_id) {
        toast.success("Consulenza avviata! Verrai reindirizzato a breve.")
        // TODO: Redirect to the correct page based on service type
        router.push(`/chat/${result.data.live_consultation_id}`)
      } else {
        toast.error(result.error || "Si è verificato un errore sconosciuto.")
      }
      setTargetService(null)
    })
  }

  const isChatDisabled = !operator.is_online || !operator.chat_consult_rate || isPending
  const isCallDisabled = !operator.is_online || !operator.phone_consult_rate || isPending
  const isWrittenDisabled = !operator.written_consult_rate || isPending

  return (
    <div className="flex flex-col gap-4 w-full">
      <Button
        size="lg"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg transition-all duration-300 ease-in-out transform hover:scale-105"
        disabled={isChatDisabled}
        onClick={() => handleStartConsultation("chat")}
      >
        {isPending && targetService === "chat" ? (
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        ) : (
          <MessageCircle className="mr-2 h-5 w-5" />
        )}
        <span>Inizia Chat (€{operator.chat_consult_rate?.toFixed(2)}/min)</span>
      </Button>
      <Button
        size="lg"
        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold text-lg transition-all duration-300 ease-in-out transform hover:scale-105"
        disabled={isCallDisabled}
        onClick={() => handleStartConsultation("call")}
      >
        {isPending && targetService === "call" ? (
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        ) : (
          <Phone className="mr-2 h-5 w-5" />
        )}
        <span>Inizia Chiamata (€{operator.phone_consult_rate?.toFixed(2)}/min)</span>
      </Button>
      <Button
        size="lg"
        variant="outline"
        className="w-full border-amber-400 text-amber-400 hover:bg-amber-400/10 hover:text-amber-300 font-bold text-lg transition-all duration-300 ease-in-out transform hover:scale-105 bg-transparent"
        disabled={isWrittenDisabled}
        // onClick={() => openWrittenConsultationModal()} // TODO: Implement this
      >
        <Send className="mr-2 h-5 w-5" />
        <span>Consulto Scritto (€{operator.written_consult_rate?.toFixed(2)})</span>
      </Button>
    </div>
  )
}
