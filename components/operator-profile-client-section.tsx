"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { WrittenConsultationModal } from "@/components/written-consultation-modal"
import { AlertTriangle } from "lucide-react"

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

  const commonButtonClasses =
    "w-full text-white flex-col h-auto py-3 rounded-lg shadow-md transform transition-all duration-200 hover:scale-[1.02] focus:scale-[1.02]"

  // Colori come da screenshot
  const onlineButtonClasses = "bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700"
  const offlineButtonClasses = "bg-[#4A90A4] opacity-70 cursor-not-allowed"
  const emailButtonClasses = "bg-[#3A5FCD] hover:bg-[#4a6fdc]"

  const renderButtonContent = (title: string, price: number, priceUnit: string, isOnline?: boolean) => (
    <>
      <span className="font-semibold text-base">{title}</span>
      <span className="text-xs opacity-90">
        {price.toFixed(2)}€/{priceUnit}
      </span>
      {isOnline === false && <span className="text-xs font-semibold mt-1">(Offline)</span>}
    </>
  )

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {chatService && (
          <Button
            asChild={operator.isOnline}
            size="lg"
            className={`${commonButtonClasses} ${operator.isOnline ? onlineButtonClasses : offlineButtonClasses}`}
            disabled={!operator.isOnline}
            onClick={(e) => !operator.isOnline && e.preventDefault()}
          >
            <Link href={`/chat/new?operatorId=${operator.id}`}>
              {renderButtonContent("Avvia Chat Ora", chatService.price, "min", operator.isOnline)}
            </Link>
          </Button>
        )}
        {callService && (
          <Button
            asChild={operator.isOnline}
            size="lg"
            className={`${commonButtonClasses} ${operator.isOnline ? onlineButtonClasses : offlineButtonClasses}`}
            disabled={!operator.isOnline}
            onClick={(e) => !operator.isOnline && e.preventDefault()}
          >
            <Link href={`/call/new?operatorId=${operator.id}`}>
              {renderButtonContent("Chiama", callService.price, "min", operator.isOnline)}
            </Link>
          </Button>
        )}
        {writtenService && (
          <Button
            size="lg"
            className={`${commonButtonClasses} ${emailButtonClasses}`}
            onClick={() => setIsModalOpen(true)}
          >
            {renderButtonContent("Email", writtenService.price, "consulto")}
          </Button>
        )}
      </div>

      {!operator.isOnline && (
        <div className="mt-4 flex items-center text-yellow-200 bg-black/20 rounded-lg p-3 text-sm border border-yellow-400/20">
          <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 text-yellow-400" />
          <span>L'operatore è offline. Puoi comunque richiedere una consulenza via email.</span>
        </div>
      )}

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
