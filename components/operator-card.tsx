"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, MessageSquare, Phone, Video } from "lucide-react"
import type { OperatorWithDetails } from "@/lib/actions/admin.actions"
import { startChatSession } from "@/lib/actions/chat.actions"
import { useState } from "react"

export function OperatorCard({ operator }: { operator: OperatorWithDetails }) {
  const [isLoading, setIsLoading] = useState(false)

  const handleStartChat = async () => {
    setIsLoading(true)
    await startChatSession(operator.id)
    // Redirect is handled by the server action
    setIsLoading(false)
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 border border-slate-200/80">
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="relative">
            <Image
              src={operator.avatar_url || "/placeholder.svg?width=80&height=80"}
              alt={operator.operator_details?.stage_name || operator.name || "Operatore"}
              width={80}
              height={80}
              className="rounded-full border-4 border-blue-200 object-cover"
            />
            <span
              className={`absolute bottom-1 right-1 block h-4 w-4 rounded-full border-2 border-white ${
                operator.status === "active" ? "bg-green-500" : "bg-slate-400"
              }`}
            />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-slate-800">
                  {operator.operator_details?.stage_name || operator.name}
                </h3>
                <p className="text-sm text-slate-500">Cartomante, Astrologa</p>
              </div>
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="w-5 h-5 fill-current" />
                <span className="font-bold text-base">4.9</span>
              </div>
            </div>
            <p className="text-sm text-slate-600 mt-2 line-clamp-2">
              {operator.operator_details?.bio || "Esperta in letture d'amore e percorsi di vita."}
            </p>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1">
              <MessageSquare className="w-3.5 h-3.5" /> Chat
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Phone className="w-3.5 h-3.5" /> Tel
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Video className="w-3.5 h-3.5" /> Video
            </Badge>
          </div>
          <div className="text-right">
            <p className="font-bold text-lg text-slate-800">€1.20/min</p>
            <p className="text-xs text-slate-500">IVA inclusa</p>
          </div>
        </div>
      </div>
      <div className="bg-slate-50/70 p-3 grid grid-cols-2 gap-3">
        <Button variant="outline" className="w-full bg-transparent">
          Vedi Profilo
        </Button>
        <form action={handleStartChat} className="w-full">
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={isLoading}>
            {isLoading ? "Avvio..." : "Chatta Ora"}
          </Button>
        </form>
      </div>
    </div>
  )
}
