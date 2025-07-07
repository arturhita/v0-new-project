"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Star, MessageCircle, Phone, Mail, Users, Sparkles, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import { initiateChatRequest } from "@/lib/actions/chat.actions"
import { WrittenConsultationModal } from "./written-consultation-modal"
import type { OperatorCardData } from "@/lib/actions/operator.actions"

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

  const profileLink = `/operator/${(operator.fullName || "esperto").toLowerCase().replace(/ /g, "-")}`

  const getServicePrice = (type: "chat" | "call" | "email") => {
    const service = operator.services.find((s) => s.type === type)
    return service?.price
  }

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

  const chatPrice = getServicePrice("chat")
  const callPrice = getServicePrice("call")
  const emailPrice = getServicePrice("email")

  return (
    <>
      <div className="group relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 backdrop-blur-xl rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-3 hover:scale-105 border border-yellow-600/20 hover:border-yellow-600/40 h-full flex flex-col">
        {/* Online Status & New Badge */}
        <div className="absolute top-4 left-4 z-20">
          {showNewBadge && (
            <Badge className="bg-gradient-to-r from-yellow-600 to-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-pulse">
              <Sparkles className="w-3 h-3 mr-1" />
              NUOVO
            </Badge>
          )}
        </div>
        <div className="absolute top-4 right-4 z-20">
          <div
            className={cn(
              "flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium shadow-lg backdrop-blur-xl",
              operator.isOnline ? "bg-green-500/90 text-white animate-pulse" : "bg-gray-500/90 text-white",
            )}
          >
            <div className={cn("w-2 h-2 rounded-full", operator.isOnline ? "bg-white animate-ping" : "bg-gray-300")} />
            {operator.isOnline ? "Online" : "Offline"}
          </div>
        </div>

        {/* Card Content */}
        <div className="relative p-6 text-center flex-1 flex flex-col">
          <div className="relative mx-auto mb-4 group-hover:scale-110 transition-transform duration-500">
            <div className="w-20 h-20 rounded-full overflow-hidden shadow-lg ring-4 ring-yellow-600/30 group-hover:ring-yellow-600/50 transition-all duration-500">
              {!imageError ? (
                <img
                  src={operator.avatarUrl || "/placeholder.svg"}
                  alt={operator.fullName || "Operatore"}
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-600 to-yellow-600 flex items-center justify-center text-white text-2xl font-bold">
                  {(operator.fullName || "E").charAt(0)}
                </div>
              )}
            </div>
            <div className="absolute inset-0 rounded-full bg-yellow-600/20 blur-md scale-110 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </div>

          <h3 className="text-lg font-bold mb-2 text-white group-hover:text-yellow-100 transition-colors duration-500">
            {operator.fullName || "Operatore"}
          </h3>
          <p className="text-sm text-white/80 mb-3 font-medium group-hover:text-white/90 transition-colors duration-500">
            {operator.headline || "Esperto di discipline olistiche"}
          </p>

          <div className="flex items-center justify-center space-x-1 mb-3">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "w-4 h-4 transition-colors duration-300",
                    i < Math.round(operator.averageRating) ? "text-yellow-500 fill-current" : "text-gray-400",
                  )}
                />
              ))}
            </div>
            <span className="text-sm font-medium text-white/90">
              {operator.averageRating.toFixed(1)} ({operator.reviewsCount})
            </span>
          </div>

          <p className="text-sm text-white/70 mb-4 leading-relaxed flex-1 group-hover:text-white/80 transition-colors duration-500">
            {operator.bio || "Un operatore esperto pronto ad aiutarti."}
          </p>

          <div className="flex flex-wrap justify-center gap-1 mb-4">
            {operator.specializations.slice(0, 3).map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-xs bg-blue-700/50 text-white border border-yellow-600/30 hover:bg-blue-600/50 transition-colors duration-300"
              >
                {tag}
              </Badge>
            ))}
          </div>

          <div className="space-y-2 mb-4">
            {chatPrice !== undefined && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2 text-white/80">
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat</span>
                </div>
                <span className="font-medium text-yellow-200">{chatPrice.toFixed(2)} €/min</span>
              </div>
            )}
            {callPrice !== undefined && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2 text-white/80">
                  <Phone className="w-4 h-4" />
                  <span>Chiamata</span>
                </div>
                <span className="font-medium text-yellow-200">{callPrice.toFixed(2)} €/min</span>
              </div>
            )}
            {emailPrice !== undefined && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2 text-white/80">
                  <Mail className="w-4 h-4" />
                  <span>Email</span>
                </div>
                <span className="font-medium text-yellow-200">{emailPrice.toFixed(2)} €</span>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 pt-0 mt-auto">
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-2">
              {chatPrice !== undefined && (
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
              {callPrice !== undefined && (
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-yellow-600 text-white hover:from-blue-700 hover:to-yellow-700 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 text-xs font-semibold"
                >
                  <Phone className="w-3 h-3 mr-1" />
                  Chiama
                </Button>
              )}
              {emailPrice !== undefined && (
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
            <Link href={profileLink} className="block">
              <Button
                variant="outline"
                size="sm"
                className="w-full bg-gradient-to-r from-blue-600 to-yellow-600 text-white hover:from-blue-700 hover:to-yellow-700 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 border-0 font-semibold"
              >
                <Users className="w-3 h-3 mr-2" />
                Vedi Profilo
              </Button>
            </Link>
          </div>
        </div>
        <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-yellow-600/30 transition-all duration-500 pointer-events-none"></div>
      </div>
      {emailPrice !== undefined && (
        <WrittenConsultationModal
          isOpen={isEmailModalOpen}
          onClose={() => setIsEmailModalOpen(false)}
          operator={{ id: operator.id, name: operator.fullName || "Operatore", emailPrice: emailPrice }}
        />
      )}
    </>
  )
}
