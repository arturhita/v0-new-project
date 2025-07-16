"use client"

import type React from "react"

import Image from "next/image"
import Link from "next/link"
import { Star, MessageCircle, Phone, Mail, BadgeCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"

export type Operator = {
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
  joinedDate?: string
}

export function OperatorCard({
  operator,
  showNewBadge = false,
  currentUser,
}: {
  operator: Operator
  showNewBadge?: boolean
  currentUser: User | null
}) {
  const router = useRouter()

  const handleChatClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!currentUser) {
      router.push("/login?redirect=/operator/" + operator.id)
      return
    }
    // Logica per iniziare la chat
    console.log("Inizio chat con", operator.name)
    router.push(`/chat/new?operatorId=${operator.id}`)
  }

  const handleCallClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!currentUser) {
      router.push("/login?redirect=/operator/" + operator.id)
      return
    }
    // Logica per iniziare la chiamata
    console.log("Inizio chiamata con", operator.name)
  }

  const handleEmailClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!currentUser) {
      router.push("/login?redirect=/operator/" + operator.id)
      return
    }
    // Logica per consulto via email
    console.log("Richiesta email a", operator.name)
  }

  return (
    <Link href={`/operator/${operator.id}`} className="block group">
      <div className="relative bg-gradient-to-br from-blue-900/50 via-slate-800/50 to-blue-900/50 backdrop-blur-md rounded-2xl shadow-lg hover:shadow-yellow-400/10 transition-all duration-500 transform hover:-translate-y-2 h-full flex flex-col border border-blue-700/50">
        <div className="relative">
          <Image
            src={operator.avatarUrl || "/placeholder.svg"}
            alt={operator.name}
            width={300}
            height={200}
            className="w-full h-48 object-cover rounded-t-2xl"
          />
          <div className="absolute top-2 right-2">
            <div
              className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold ${
                operator.isOnline ? "bg-green-500/80 text-white" : "bg-slate-600/80 text-slate-200"
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${operator.isOnline ? "bg-white" : "bg-slate-400"}`}></span>
              <span>{operator.isOnline ? "Online" : "Offline"}</span>
            </div>
          </div>
          {showNewBadge && (
            <Badge className="absolute top-2 left-2 bg-yellow-400 text-slate-900 font-bold border-0">Nuovo</Badge>
          )}
        </div>

        <div className="p-5 flex flex-col flex-grow">
          <div className="flex justify-between items-start">
            <h3 className="text-xl font-bold text-white group-hover:text-yellow-300 transition-colors duration-300 flex items-center">
              {operator.name}
              <BadgeCheck className="ml-2 h-5 w-5 text-blue-400" />
            </h3>
            <div className="flex items-center text-yellow-400">
              <Star className="w-4 h-4 mr-1" fill="currentColor" />
              <span className="font-bold">{operator.rating.toFixed(1)}</span>
            </div>
          </div>
          <p className="text-sm text-blue-300 mb-3">{operator.specialization}</p>

          <p className="text-slate-300 text-sm leading-relaxed flex-grow mb-4">{operator.description}</p>

          <div className="flex flex-wrap gap-2 mb-4">
            {operator.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="bg-blue-800/50 text-blue-200 border-blue-700">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <div className="px-5 pb-5 mt-auto">
          <div className="flex items-center justify-around gap-2 bg-slate-900/50 p-2 rounded-lg">
            {operator.services.chatPrice && (
              <Button
                size="sm"
                variant="ghost"
                className="flex-1 flex flex-col h-auto py-1 text-slate-300 hover:bg-blue-700/50 hover:text-white"
                onClick={handleChatClick}
              >
                <MessageCircle className="h-5 w-5 mb-1" />
                <span className="text-xs">Chat</span>
              </Button>
            )}
            {operator.services.callPrice && (
              <Button
                size="sm"
                variant="ghost"
                className="flex-1 flex flex-col h-auto py-1 text-slate-300 hover:bg-blue-700/50 hover:text-white"
                onClick={handleCallClick}
              >
                <Phone className="h-5 w-5 mb-1" />
                <span className="text-xs">Chiamata</span>
              </Button>
            )}
            {operator.services.emailPrice && (
              <Button
                size="sm"
                variant="ghost"
                className="flex-1 flex flex-col h-auto py-1 text-slate-300 hover:bg-blue-700/50 hover:text-white"
                onClick={handleEmailClick}
              >
                <Mail className="h-5 w-5 mb-1" />
                <span className="text-xs">Email</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
