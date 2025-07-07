"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Star, MessageCircle, Phone, Mail, Users, Sparkles, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import { initiateChatRequest } from "@/lib/actions/chat.actions"
import { WrittenConsultationModal } from "./written-consultation-modal"
import type { OperatorProfile as Operator } from "@/lib/actions/operator.actions"

interface OperatorCardProps {
  operator: Operator
}

export function OperatorCard({ operator }: OperatorCardProps) {
  const [isStartingChat, setIsStartingChat] = useState(false)
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false)
  const router = useRouter()
  const { user } = useAuth()

  const isNewOperator = new Date(operator.joinedDate) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const operatorSlug = operator.fullName.toLowerCase().replace(/\s+/g, "-")
  const profileLink = `/operator/${operatorSlug}`

  const getServicePrice = (type: "chat" | "call" | "email") => {
    const service = operator.services.find((s) => s.type === type)
    return service ? service.price : null
  }

  const chatPrice = getServicePrice("chat")
  const callPrice = getServicePrice("call")
  const emailPrice = getServicePrice("email")

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
      <div className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-yellow-600/20 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 shadow-lg transition-all duration-700 hover:-translate-y-3 hover:scale-105 hover:border-yellow-600/40 hover:shadow-2xl">
        <div className="absolute top-4 left-4 z-20">
          {isNewOperator && (
            <Badge className="animate-pulse rounded-full bg-gradient-to-r from-yellow-600 to-yellow-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
              <Sparkles className="mr-1 h-3 w-3" />
              NUOVO
            </Badge>
          )}
        </div>
        <div className="absolute top-4 right-4 z-20">
          <div
            className={cn(
              "flex items-center space-x-2 rounded-full px-3 py-1 text-xs font-medium shadow-lg backdrop-blur-xl",
              operator.isOnline ? "animate-pulse bg-green-500/90 text-white" : "bg-gray-500/90 text-white",
            )}
          >
            <div className={cn("h-2 w-2 rounded-full", operator.isOnline ? "animate-ping bg-white" : "bg-gray-300")} />
            {operator.isOnline ? "Online" : "Offline"}
          </div>
        </div>

        <div className="relative flex flex-1 flex-col p-6 text-center">
          <div className="relative mx-auto mb-4 transition-transform duration-500 group-hover:scale-110">
            <div className="h-20 w-20 overflow-hidden rounded-full shadow-lg ring-4 ring-yellow-600/30 transition-all duration-500 group-hover:ring-yellow-600/50">
              <Image
                src={operator.avatarUrl || "/placeholder.svg?width=80&height=80&text=E"}
                alt={operator.fullName}
                width={80}
                height={80}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute inset-0 scale-110 rounded-full bg-yellow-600/20 opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-100"></div>
          </div>

          <h3 className="text-lg font-bold text-white transition-colors duration-500 group-hover:text-yellow-100">
            {operator.fullName}
          </h3>
          <p className="mb-3 text-sm font-medium text-white/80 transition-colors duration-500 group-hover:text-white/90">
            {operator.headline}
          </p>

          <div className="mb-3 flex items-center justify-center space-x-1">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-4 w-4 transition-colors duration-300",
                    i < Math.round(operator.averageRating) ? "fill-current text-yellow-500" : "text-gray-400",
                  )}
                />
              ))}
            </div>
            <span className="text-sm font-medium text-white/90">
              {operator.averageRating.toFixed(1)} ({operator.reviewsCount})
            </span>
          </div>

          <p className="mb-4 flex-1 text-sm leading-relaxed text-white/70 transition-colors duration-500 group-hover:text-white/80">
            {operator.bio}
          </p>

          <div className="mb-4 flex flex-wrap justify-center gap-1">
            {operator.specializations.slice(0, 3).map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="border border-yellow-600/30 bg-blue-700/50 text-white transition-colors duration-300 hover:bg-blue-600/50"
              >
                {tag}
              </Badge>
            ))}
          </div>

          <div className="mb-4 space-y-2">
            {chatPrice !== null && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2 text-white/80">
                  <MessageCircle className="h-4 w-4" />
                  <span>Chat</span>
                </div>
                <span className="font-medium text-yellow-200">{chatPrice.toFixed(2)} €/min</span>
              </div>
            )}
            {callPrice !== null && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2 text-white/80">
                  <Phone className="h-4 w-4" />
                  <span>Chiamata</span>
                </div>
                <span className="font-medium text-yellow-200">{callPrice.toFixed(2)} €/min</span>
              </div>
            )}
            {emailPrice !== null && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2 text-white/80">
                  <Mail className="h-4 w-4" />
                  <span>Email</span>
                </div>
                <span className="font-medium text-yellow-200">{emailPrice.toFixed(2)} €</span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-auto p-6 pt-0">
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-2">
              {chatPrice !== null && (
                <Button
                  onClick={handleStartChat}
                  disabled={isStartingChat || !operator.isOnline}
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-yellow-600 text-xs font-semibold text-white shadow-md transition-all duration-300 hover:scale-105 hover:from-blue-700 hover:to-yellow-700 hover:shadow-lg"
                >
                  {isStartingChat ? (
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  ) : (
                    <MessageCircle className="mr-1 h-3 w-3" />
                  )}
                  Chat
                </Button>
              )}
              {callPrice !== null && (
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-yellow-600 text-xs font-semibold text-white shadow-md transition-all duration-300 hover:scale-105 hover:from-blue-700 hover:to-yellow-700 hover:shadow-lg"
                >
                  <Phone className="mr-1 h-3 w-3" />
                  Chiama
                </Button>
              )}
              {emailPrice !== null && (
                <Button
                  onClick={handleOpenEmailModal}
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-yellow-600 text-xs font-semibold text-white shadow-md transition-all duration-300 hover:scale-105 hover:from-blue-700 hover:to-yellow-700 hover:shadow-lg"
                >
                  <Mail className="mr-1 h-3 w-3" />
                  Email
                </Button>
              )}
            </div>
            <Link href={profileLink} className="block">
              <Button
                variant="outline"
                size="sm"
                className="w-full border-0 bg-gradient-to-r from-blue-600 to-yellow-600 font-semibold text-white shadow-md transition-all duration-300 hover:scale-105 hover:from-blue-700 hover:to-yellow-700 hover:shadow-lg"
              >
                <Users className="mr-2 h-3 w-3" />
                Vedi Profilo
              </Button>
            </Link>
          </div>
        </div>
        <div className="pointer-events-none absolute inset-0 rounded-3xl border-2 border-transparent transition-all duration-500 group-hover:border-yellow-600/30"></div>
      </div>
      {emailPrice !== null && (
        <WrittenConsultationModal
          isOpen={isEmailModalOpen}
          onClose={() => setIsEmailModalOpen(false)}
          operator={{ id: operator.id, name: operator.fullName, emailPrice: emailPrice }}
        />
      )}
    </>
  )
}
