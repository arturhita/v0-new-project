"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { WrittenConsultationModal } from "@/components/written-consultation-modal"
import { MessageSquare, Phone, Mail } from "lucide-react"

interface Service {
  service_type: "chat" | "call" | "written"
  price: number
}

interface OperatorProfileClientSectionProps {
  operator: {
    id: string
    fullName: string
    services: Service[]
  }
}

export function OperatorProfileClientSection({ operator }: OperatorProfileClientSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const chatService = operator.services.find((s) => s.service_type === "chat")
  const callService = operator.services.find((s) => s.service_type === "call")
  const writtenService = operator.services.find((s) => s.service_type === "written")

  return (
    <>
      <div className="w-full space-y-3">
        {chatService && (
          <Button asChild size="lg" className="w-full bg-green-600 hover:bg-green-700">
            <Link href={`/chat/new?operatorId=${operator.id}`}>
              <MessageSquare className="mr-2 h-5 w-5" /> Inizia Chat
            </Link>
          </Button>
        )}
        {callService && (
          <Button asChild size="lg" className="w-full bg-blue-600 hover:bg-blue-700">
            <Link href={`/call/new?operatorId=${operator.id}`}>
              <Phone className="mr-2 h-5 w-5" /> Chiama Ora
            </Link>
          </Button>
        )}
        {writtenService && (
          <Button size="lg" className="w-full" onClick={() => setIsModalOpen(true)}>
            <Mail className="mr-2 h-5 w-5" /> Richiedi Consulto Scritto
          </Button>
        )}
      </div>

      {writtenService && (
        <WrittenConsultationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          operator={{
            id: operator.id,
            name: operator.fullName,
            emailPrice: writtenService.price,
          }}
        />
      )}
    </>
  )
}
