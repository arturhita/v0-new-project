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

interface OperatorCardProps {
  operator: Profile
  showNewBadge?: boolean
}

export function OperatorCard({ operator, showNewBadge = false }: OperatorCardProps) {
  const [isStartingChat, setIsStartingChat] = useState(false)
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false)
  const router = useRouter()
  const { user } = useAuth()

  const isNewOperator =
    showNewBadge && operator.created_at
      ? new Date(operator.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      : false

  const profileLink = `/operator/${encodeURIComponent(operator.stage_name || "")}`

  const handleStartChat = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user) {
      alert("Devi effettuare l'accesso per avviare una chat.")
      router.push("/login")
      return
    }

    if (!operator.is_available) {
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

  const stageName = operator.stage_name || "Operatore"
  const specializations = operator.specializations || []
  const avatarUrl = operator.avatar_url || "/placeholder.svg?width=100&height=100"
  const isAvailable = operator.is_available || false
  const averageRating = operator.average_rating || 0
  const reviewCount = operator.review_count || 0
  const chatPrice = operator.service_prices?.chat
  const callPrice = operator.service_prices?.call
  const emailPrice = operator.service_prices?.email

  return (
    <>
      <Link href={profileLink} className="group block h-full">
        <Card className="h-full flex flex-col overflow-hidden rounded-2xl bg-gradient-to-br from-[#0a1a5c] via-[#1E3C98] to-[#0a1a5c] text-white backdrop-blur-lg border border-blue-400/30 shadow-2xl transition-all duration-300 group-hover:shadow-cyan-500/20 group-hover:scale-105">
          <CardContent className="p-4 flex flex-col h-full">
            <div className="flex items-center gap-4 mb-4">
              <Avatar className="w-16 h-16 border-2 border-cyan-300/30 flex-shrink-0">
                <AvatarImage src={avatarUrl || "/placeholder.svg"} alt={stageName} />
                <AvatarFallback className="text-lg bg-blue-900 text-white">
                  {stageName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-grow overflow-hidden">
                <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                  {stageName}
                </h3>
                <p className="text-blue-200 text-xs h-8 overflow-hidden">
                  {specializations.length > 0 ? specializations.join(", ") : "Nessuna specializzazione"}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <Badge
                variant="secondary"
                className={`text-xs px-2 py-1 ${
                  isAvailable ? "bg-green-500 text-white border-green-400" : "bg-gray-400 text-white border-gray-500"
                }`}
              >
                {isAvailable ? "Online" : "Offline"}
              </Badge>
              <div className="flex items-center space-x-1 text-xs">
                <Star className="w-3 h-3 fill-cyan-400 text-cyan-400" />
                <span className="font-bold text-white">{averageRating.toFixed(1)}</span>
                <span className="text-blue-300">({reviewCount})</span>
              </div>
            </div>

            <div className="space-y-1 text-xs mb-4">
              {chatPrice && (
                <div className="flex justify-between">
                  <span>Chat</span>
                  <span>{chatPrice.toFixed(2)} €/min</span>
                </div>
              )}
              {callPrice && (
                <div className="flex justify-between">
                  <span>Chiamata</span>
                  <span>{callPrice.toFixed(2)} €/min</span>
                </div>
              )}
              {emailPrice && (
                <div className="flex justify-between">
                  <span>Email</span>
                  <span>{emailPrice.toFixed(2)} €</span>
                </div>
              )}
            </div>

            <div className="mt-auto space-y-2">
              <div className="grid grid-cols-3 gap-2">
                {chatPrice && (
                  <Button
                    onClick={handleStartChat}
                    disabled={isStartingChat || !isAvailable}
                    size="sm"
                    className="text-xs"
                  >
                    {isStartingChat ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <MessageCircle className="w-3 h-3" />
                    )}
                  </Button>
                )}
                {callPrice && (
                  <Button size="sm" className="text-xs">
                    <Phone className="w-3 h-3" />
                  </Button>
                )}
                {emailPrice && (
                  <Button onClick={handleOpenEmailModal} size="sm" className="text-xs">
                    <Mail className="w-3 h-3" />
                  </Button>
                )}
              </div>
              <Button variant="outline" size="sm" className="w-full text-xs bg-transparent">
                <Users className="w-3 h-3 mr-2" />
                Vedi Profilo
              </Button>
            </div>
          </CardContent>
        </Card>
      </Link>
      {emailPrice && (
        <WrittenConsultationModal
          isOpen={isEmailModalOpen}
          onClose={() => setIsEmailModalOpen(false)}
          operator={{ id: operator.id, name: stageName, emailPrice: emailPrice }}
        />
      )}
    </>
  )
}
