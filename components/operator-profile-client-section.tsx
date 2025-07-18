"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { WrittenConsultationModal } from "@/components/written-consultation-modal"
import { MessageSquare, Phone, Mail } from "lucide-react"
import { cn } from "@/lib/utils"

interface Service {
  service_type: "chat" | "call" | "written"
  price: number
}

interface OperatorProfileClientSectionProps {
  operator: {
    id: string
    stageName: string
    services: Service[]
    isOnline: boolean
  }
}

export function OperatorProfileClientSection({ operator }: OperatorProfileClientSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const chatService = operator.services.find((s) => s.service_type === "chat")
  const callService = operator.services.find((s) => s.service_type === "call")
  const writtenService = operator.services.find((s) => s.service_type === "written")

  const buttonBaseClasses =
    "w-full text-base font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2"

  return (
    <>
      <div className="w-full space-y-3">
        {chatService && (
          <Button
            asChild
            size="lg"
            className={cn(
              buttonBaseClasses,
              "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700",
              !operator.isOnline && "bg-slate-500 hover:bg-slate-600 cursor-not-allowed",
            )}
            disabled={!operator.isOnline}
          >
            <Link href={`/chat/new?operatorId=${operator.id}`}>
              <MessageSquare className="h-5 w-5" /> Inizia Chat (€{chatService.price.toFixed(2)}/min)
            </Link>
          </Button>
        )}
        {callService && (
          <Button
            asChild
            size="lg"
            className={cn(
              buttonBaseClasses,
              "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700",
              !operator.isOnline && "bg-slate-500 hover:bg-slate-600 cursor-not-allowed",
            )}
            disabled={!operator.isOnline}
          >
            <Link href={`/call/new?operatorId=${operator.id}`}>
              <Phone className="h-5 w-5" /> Chiama Ora (€{callService.price.toFixed(2)}/min)
            </Link>
          </Button>
        )}
        {writtenService && (
          <Button
            size="lg"
            className={cn(
              buttonBaseClasses,
              "bg-gradient-to-r from-purple-500 to-violet-600 text-white hover:from-purple-600 hover:to-violet-700",
            )}
            onClick={() => setIsModalOpen(true)}
          >
            <Mail className="h-5 w-5" /> Consulto Scritto (€{writtenService.price.toFixed(2)})
          </Button>
        )}
      </div>

      {writtenService && (
        <WrittenConsultationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          operator={{
            id: operator.id,
            name: operator.stageName,
            emailPrice: writtenService.price,
          }}
        />
      )}
    </>
  )
}
