"use client"

import type React from "react"

import Image from "next/image"
import { Star, Phone, MessageSquare, Mail, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { User } from "@supabase/supabase-js"

export type Operator = {
  id: string
  name: string
  avatarUrl?: string | null
  specialization: string
  rating: number
  reviewsCount: number
  description: string
  tags: string[]
  isOnline: boolean
  services: {
    chatPrice?: number | null
    callPrice?: number | null
    emailPrice?: number | null
  }
  joinedDate?: string
}

type OperatorCardProps = {
  operator: Operator
  currentUser: User | null
  showNewBadge?: boolean
}

export function OperatorCard({ operator, currentUser, showNewBadge = false }: OperatorCardProps) {
  const handleChatClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!currentUser) {
      // Potresti usare un toast per notificare l'utente
      alert("Devi essere loggato per iniziare una chat.")
      return
    }
    // Logica per iniziare la chat...
    console.log(`Inizio chat con ${operator.name}`)
  }

  return (
    <div className="group relative flex flex-col h-full bg-gradient-to-br from-blue-900/50 via-slate-800/50 to-blue-900/50 backdrop-blur-md rounded-2xl shadow-lg hover:shadow-yellow-400/10 transition-all duration-500 transform hover:-translate-y-2 border border-blue-700/50 overflow-hidden">
      {showNewBadge && (
        <div className="absolute top-2 right-2 bg-yellow-400 text-slate-900 text-xs font-bold px-2 py-1 rounded-full flex items-center z-10">
          <Sparkles className="w-3 h-3 mr-1" />
          NUOVO
        </div>
      )}
      <div className="relative p-6 flex-grow flex flex-col">
        <div className="flex items-center mb-4">
          <div className="relative">
            <Image
              src={operator.avatarUrl || "/placeholder.svg?width=96&height=96"}
              alt={`Foto di ${operator.name}`}
              width={80}
              height={80}
              className="rounded-full object-cover border-4 border-blue-700/50 group-hover:border-yellow-400/80 transition-colors duration-300"
            />
            <span
              className={`absolute bottom-1 right-1 block h-4 w-4 rounded-full ${
                operator.isOnline ? "bg-green-500" : "bg-slate-500"
              } border-2 border-slate-800`}
              title={operator.isOnline ? "Online" : "Offline"}
            />
          </div>
          <div className="ml-4">
            <h3 className="text-xl font-bold text-white">{operator.name}</h3>
            <p className="text-sm text-yellow-400 font-semibold">{operator.specialization}</p>
          </div>
        </div>

        <div className="flex items-center text-sm text-slate-300 mb-4">
          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
          <span className="font-bold text-white">{operator.rating.toFixed(1)}</span>
          <span className="mx-2">·</span>
          <span>{operator.reviewsCount} recensioni</span>
        </div>

        <p className="text-slate-300 text-sm mb-4 flex-grow">{operator.description}</p>

        <div className="flex flex-wrap gap-2 mb-5">
          {operator.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-xs bg-blue-800/70 text-blue-200 px-2 py-1 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="bg-slate-900/50 p-4 mt-auto">
        <div className="flex justify-around items-center">
          {operator.services.chatPrice && (
            <Button
              variant="ghost"
              size="sm"
              className="flex flex-col h-auto text-slate-300 hover:bg-blue-700/50 hover:text-white"
              onClick={handleChatClick}
            >
              <MessageSquare className="w-5 h-5 mb-1" />
              <span className="text-xs">Chat</span>
            </Button>
          )}
          {operator.services.callPrice && (
            <Button
              variant="ghost"
              size="sm"
              className="flex flex-col h-auto text-slate-300 hover:bg-blue-700/50 hover:text-white"
            >
              <Phone className="w-5 h-5 mb-1" />
              <span className="text-xs">Chiama</span>
            </Button>
          )}
          {operator.services.emailPrice && (
            <Button
              variant="ghost"
              size="sm"
              className="flex flex-col h-auto text-slate-300 hover:bg-blue-700/50 hover:text-white"
            >
              <Mail className="w-5 h-5 mb-1" />
              <span className="text-xs">Messaggio</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
