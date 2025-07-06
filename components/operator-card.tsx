"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Star, MessageCircle, Phone, Mail, Users, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { initiateChatRequest } from "@/lib/actions/chat.actions"
import { WrittenConsultationModal } from "./written-consultation-modal"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import type { Profile } from "@/contexts/auth-context"

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
  operator: Operator | Profile
  showNewBadge?: boolean
}

export function OperatorCard({ operator, showNewBadge = false }: OperatorCardProps) {
  const [imageError, setImageError] = useState(false)
  const [isStartingChat, setIsStartingChat] = useState(false)
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false)
  const router = useRouter()
  const { user } = useAuth()

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

  const stageName = (operator as Profile).stage_name || operator.name || "Operatore"
  const specializations = (operator as Profile).specializations || [operator.specialization]
  const avatarUrl = (operator as Profile).avatar_url || operator.avatarUrl || "/placeholder.svg?width=100&height=100"
  const isAvailable = (operator as Profile).is_available || operator.isOnline || false
  const averageRating = (operator as Profile).average_rating || operator.rating || 0
  const reviewCount = (operator as Profile).review_count || operator.reviewsCount || 0

  return (
    <>
      <Link href={`/operator/${encodeURIComponent(stageName)}`} className="group block h-full">
        <Card className="h-full overflow-hidden rounded-2xl bg-gradient-to-br from-[#0a1a5c] via-[#1E3C98] to-[#0a1a5c] text-white backdrop-blur-lg border border-blue-400/30 shadow-2xl transition-all duration-300 group-hover:shadow-cyan-500/20 group-hover:scale-105">
          <CardContent className="p-6 flex flex-col h-full">
            <div className="flex items-start gap-4">
              <Avatar className="w-20 h-20 border-4 border-cyan-300/30 flex-shrink-0">
                <AvatarImage src={avatarUrl || "/placeholder.svg"} alt={stageName} />
                <AvatarFallback className="text-xl bg-blue-900 text-white">
                  {stageName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-grow">
                <h3 className="text-2xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {stageName}
                </h3>
                <p className="text-blue-200 text-sm h-10 overflow-hidden">
                  {specializations.length > 0 ? specializations.join(", ") : "Nessuna specializzazione"}
                </p>
              </div>
            </div>
            <div className="mt-4 flex-grow flex flex-col justify-end">
              <div className="flex items-center justify-between">
                <Badge
                  variant="secondary"
                  className={`${
                    isAvailable ? "bg-green-500 text-white border-green-400" : "bg-gray-400 text-white border-gray-500"
                  }`}
                >
                  <MessageCircle className="w-3 h-3 mr-1.5" />
                  {isAvailable ? "Disponibile" : "Non Disponibile"}
                </Badge>
                <div className="flex items-center space-x-1 text-sm">
                  <Star className="w-4 h-4 fill-cyan-400 text-cyan-400" />
                  <span className="font-bold text-white">{averageRating.toFixed(1)}</span>
                  <span className="text-blue-300">({reviewCount})</span>
                </div>
              </div>
              <div className="space-y-2 mt-4">
                <div className="grid grid-cols-3 gap-2">
                  {(operator as Operator).services.chatPrice && (
                    <Button
                      onClick={handleStartChat}
                      disabled={isStartingChat || !isAvailable}
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
                  {(operator as Operator).services.callPrice && (
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-blue-600 to-yellow-600 text-white hover:from-blue-700 hover:to-yellow-700 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 text-xs font-semibold"
                    >
                      <Phone className="w-3 h-3 mr-1" />
                      Chiama
                    </Button>
                  )}
                  {(operator as Operator).services.emailPrice && (
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
          </CardContent>
        </Card>
      </Link>
      {(operator as Operator).services.emailPrice && (
        <WrittenConsultationModal
          isOpen={isEmailModalOpen}
          onClose={() => setIsEmailModalOpen(false)}
          operator={{ id: operator.id, name: stageName, emailPrice: (operator as Operator).services.emailPrice }}
        />
      )}
    </>
  )
}
