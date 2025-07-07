"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { SiteNavbar } from "@/components/site-navbar"
import { useAuth } from "@/contexts/auth-context"
import { initiateChatRequest } from "@/lib/actions/chat.actions"
import { WrittenConsultationModal } from "@/components/written-consultation-modal"
import { getDetailedOperatorProfileById } from "@/lib/actions/operator.actions"
import { OperatorProfileClient } from "./operator-profile-client"

interface OperatorProfilePageProps {
  params: {
    operatorId: string
  }
}

export default async function OperatorProfilePage({ params }: OperatorProfilePageProps) {
  const operator = await getDetailedOperatorProfileById(params.operatorId)

  if (!operator) {
    throw new Error("Operator not found")
  }

  const router = useRouter()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("biografia")
  const [isStartingChat, setIsStartingChat] = useState(false)
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false)

  const handleStartChat = async () => {
    if (!user) {
      alert("Devi effettuare l'accesso per avviare una chat.")
      router.push("/login")
      return
    }
    if (!operator.isOnline) {
      alert("L'operatore non è al momento online.")
      return
    }
    setIsStartingChat(true)
    try {
      const result = await initiateChatRequest(user.id, operator.id)
      if (result.success && result.sessionId) {
        router.push(`/chat/${result.sessionId}`)
      } else {
        alert(`Errore: ${result.error || "Impossibile avviare la chat."}`)
      }
    } catch (error) {
      console.error("Failed to initiate chat:", error)
      alert("Si è verificato un errore tecnico. Riprova più tardi.")
    } finally {
      setIsStartingChat(false)
    }
  }

  const handleOpenEmailModal = () => {
    if (!user) {
      alert("Devi effettuare l'accesso per inviare una domanda.")
      router.push("/login")
      return
    }
    setIsEmailModalOpen(true)
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-100 to-blue-300 text-slate-800">
        <SiteNavbar />
        <OperatorProfileClient operator={operator} />
      </div>
      {operator.services.emailPrice && (
        <WrittenConsultationModal
          isOpen={isEmailModalOpen}
          onClose={() => setIsEmailModalOpen(false)}
          operator={{
            id: operator.id,
            name: operator.name,
            emailPrice: operator.services.emailPrice,
          }}
        />
      )}
    </>
  )
}
