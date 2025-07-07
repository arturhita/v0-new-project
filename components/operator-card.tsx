"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Star, MessageCircle, Phone, Mail, Sparkles, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { initiateChatRequest } from "@/lib/actions/chat.actions"
import { WrittenConsultationModal } from "./written-consultation-modal"
import type { OperatorCardData } from "@/lib/actions/operator.actions"

export interface Operator {
  id: string
  name: string
  avatarUrl: string
  specialization: string
  rating: number
  reviewsCount: number
  description: string
  tags: string[]
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
  operator: OperatorCardData
  showNewBadge?: boolean
}

export function OperatorCard({ operator, showNewBadge = false }: OperatorCardProps) {
  const [imageError, setImageError] = useState(false)
  const [isStartingChat, setIsStartingChat] = useState(false)
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false)
  const router = useRouter()
  const { user } = useAuth()

  const hasChat = operator.services.some((s) => s.type === "chat" && s.is_active)
  const hasCall = operator.services.some((s) => s.type === "call" && s.is_active)
  const hasWritten = operator.services.some((s) => s.type === "written" && s.is_active)

  const isNewOperator =
    showNewBadge && operator.joinedDate
      ? new Date(operator.joinedDate) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      : false

  const profileLink = operator.profileLink || `/operator/${operator.name.toLowerCase().replace(/ /g, "-")}`

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
      <div className="relative group overflow-hidden rounded-2xl border border-blue-500/20 bg-slate-900/30 backdrop-blur-sm shadow-lg hover:shadow-blue-500/20 transition-all duration-300">
        {/* Online Status & New Badge */}
        <div className="absolute top-3 right-3 z-10">
          {operator.isOnline ? (
            <Badge variant="secondary" className="bg-green-500/20 border-green-500/30 text-green-300">
              Online
            </Badge>
          ) : (
            <Badge variant="secondary" className="bg-red-500/20 border-red-500/30 text-red-300">
              Offline
            </Badge>
          )}
        </div>
        <div className="absolute top-4 left-4 z-20">
          {isNewOperator && (
            <Badge className="bg-gradient-to-r from-yellow-600 to-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-pulse">
              <Sparkles className="w-3 h-3 mr-1" />
              NUOVO
            </Badge>
          )}
        </div>

        <div className="p-5">
          <div className="flex items-center space-x-4 mb-4">
            <div className="relative">
              <Image
                src={operator.avatarUrl || "/placeholder.svg?height=80&width=80"}
                alt={operator.name || "Operatore"}
                width={80}
                height={80}
                className="rounded-full border-2 border-blue-500/50 object-cover"
                onError={() => setImageError(true)}
              />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white truncate">{operator.name}</h3>
              <div className="flex items-center text-sm text-yellow-400 mt-1">
                <Star className="w-4 h-4 mr-1 fill-current" />
                <span>{operator.rating.toFixed(1)}</span>
                <span className="text-slate-400 ml-1">({operator.reviewsCount} rec.)</span>
              </div>
            </div>
          </div>

          <p className="text-slate-300 text-sm mb-4 h-10 line-clamp-2">{operator.description}</p>

          <div className="flex flex-wrap gap-2 mb-4">
            {operator.tags?.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="border-blue-700 text-blue-300">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <div className="bg-slate-900/50 p-3 flex justify-around items-center">
          {hasChat && (
            <Button
              onClick={handleStartChat}
              disabled={isStartingChat || !operator.isOnline}
              size="sm"
              className="bg-gradient-to-r from-blue-600 to-yellow-600 text-white hover:from-blue-700 hover:to-yellow-700 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 text-xs font-semibold"
            >
              {isStartingChat ? (
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              ) : (
                <MessageCircle className="w-3 h-3 mr-1" />
              )}
              Chat
            </Button>
          )}
          {hasCall && (
            <Button
              size="sm"
              className="bg-gradient-to-r from-blue-600 to-yellow-600 text-white hover:from-blue-700 hover:to-yellow-700 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 text-xs font-semibold"
            >
              <Phone className="w-3 h-3 mr-1" />
              Chiama
            </Button>
          )}
          {hasWritten && (
            <Button
              onClick={handleOpenEmailModal}
              size="sm"
              className="bg-gradient-to-r from-blue-600 to-yellow-600 text-white hover:from-blue-700 hover:to-yellow-700 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 text-xs font-semibold"
            >
              <Mail className="w-3 h-3 mr-1" />
              Email
            </Button>
          )}
        </div>

        <Link href={profileLink} className="absolute inset-0" prefetch={false}>
          <span className="sr-only">Vedi profilo di {operator.name}</span>
        </Link>
      </div>
      {hasWritten && (
        <WrittenConsultationModal
          isOpen={isEmailModalOpen}
          onClose={() => setIsEmailModalOpen(false)}
          operator={{
            id: operator.id,
            name: operator.name,
            emailPrice: operator.services.find((s) => s.type === "written")?.price,
          }}
        />
      )}
    </>
  )
}
