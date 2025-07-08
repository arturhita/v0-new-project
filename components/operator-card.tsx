"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Star, Phone, MessageSquare, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { initiateChatRequest } from "@/lib/actions/chat.actions"
import { WrittenConsultationModal } from "./written-consultation-modal"

export interface Operator {
  id: string
  stageName: string
  bio: string
  specialties: string[]
  avatarUrl: string | null
  isOnline: boolean
  services: {
    chatPrice?: number
    callPrice?: number
    emailPrice?: number
  }
  profileLink?: string
  joinedDate?: string
}

interface OperatorCardProps {
  operator: Operator
}

export function OperatorCard({ operator }: OperatorCardProps) {
  const [imageError, setImageError] = useState(false)
  const [isStartingChat, setIsStartingChat] = useState(false)
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false)
  const router = useRouter()
  const { user } = useAuth()

  const profileLink = operator.profileLink || `/operator/${operator.stageName.toLowerCase().replace(/ /g, "-")}`

  const handleStartChat = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

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

  const handleOpenEmailModal = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) {
      alert("Devi effettuare l'accesso per inviare una domanda.")
      router.push("/login")
      return
    }
    setIsEmailModalOpen(true)
  }

  return (
    <>
      <div className="relative flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 p-4 transition-all duration-300 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10">
        {operator.isOnline && (
          <div className="absolute top-4 right-4 flex items-center gap-2 rounded-full bg-green-500/20 px-3 py-1 text-xs font-semibold text-green-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
            </span>
            Online
          </div>
        )}
        <div className="flex items-center gap-4">
          <div className="relative h-20 w-20 flex-shrink-0">
            <Image
              src={operator.avatarUrl || "/images/moon.png"}
              alt={`Foto di ${operator.stageName}`}
              fill
              className="rounded-full border-2 border-slate-700 object-cover"
              onError={() => setImageError(true)}
            />
          </div>
          <div className="flex-grow">
            <h3 className="text-xl font-bold text-white">{operator.stageName}</h3>
            <div className="flex items-center gap-1 text-sm text-amber-400">
              <Star className="h-4 w-4 fill-current" />
              <span>4.9 (123 recensioni)</span>
            </div>
          </div>
        </div>
        <p className="mt-4 text-sm text-slate-400 line-clamp-2">{operator.bio}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {operator.specialties?.slice(0, 3).map((spec) => (
            <Badge key={spec} variant="secondary" className="bg-blue-900/50 text-blue-300">
              {spec}
            </Badge>
          ))}
        </div>
        <div className="mt-auto pt-4">
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-2">
              {operator.services.chatPrice && (
                <Button
                  onClick={handleStartChat}
                  disabled={isStartingChat || !operator.isOnline}
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-yellow-600 text-white hover:from-blue-700 hover:to-yellow-700 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 text-xs font-semibold"
                >
                  {isStartingChat ? (
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  ) : (
                    <MessageSquare className="w-3 h-3 mr-1" />
                  )}
                  Chat
                </Button>
              )}
              {operator.services.callPrice && (
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-yellow-600 text-white hover:from-blue-700 hover:to-yellow-700 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 text-xs font-semibold"
                >
                  <Phone className="w-3 h-3 mr-1" />
                  Chiama
                </Button>
              )}
              {operator.services.emailPrice && (
                <Button
                  onClick={handleOpenEmailModal}
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-yellow-600 text-white hover:from-blue-700 hover:to-yellow-700 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 text-xs font-semibold"
                >
                  <MessageSquare className="w-3 h-3 mr-1" />
                  Email
                </Button>
              )}
            </div>
            <Link href={profileLink} className="block">
              <Button
                variant="outline"
                size="sm"
                className="w-full bg-gradient-to-r from-blue-600 to-yellow-600 text-white hover:from-blue-700 hover:to-yellow-700 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 border-0 font-semibold"
              >
                <MessageSquare className="w-3 h-3 mr-2" />
                Vedi Profilo
              </Button>
            </Link>
          </div>
        </div>
      </div>
      {operator.services.emailPrice && (
        <WrittenConsultationModal
          isOpen={isEmailModalOpen}
          onClose={() => setIsEmailModalOpen(false)}
          operator={{ id: operator.id, name: operator.stageName, emailPrice: operator.services.emailPrice }}
        />
      )}
    </>
  )
}
