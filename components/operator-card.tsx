"use client"

import Link from "next/link"
import { Star, MessageCircle, Phone, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { OperatorCardData } from "@/lib/actions/operator.actions"

interface OperatorCardProps {
  operator: OperatorCardData
}

export function OperatorCard({ operator }: OperatorCardProps) {
  const getInitials = (name: string | null) => {
    if (!name) return ""
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
  }

  const chatPrice = operator.services.find((s) => s.type === "chat")?.price
  const callPrice = operator.services.find((s) => s.type === "call")?.price

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-blue-800/50 bg-gradient-to-br from-slate-900/80 to-blue-950/70 p-6 shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-cyan-400/50 hover:shadow-cyan-500/10">
      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-cyan-500/10 blur-3xl transition-all duration-500 group-hover:-right-0 group-hover:-top-0 group-hover:scale-150"></div>

      <div className="flex items-center space-x-4">
        <Avatar className="h-16 w-16 border-2 border-blue-700/80 transition-all duration-300 group-hover:border-cyan-400">
          <AvatarImage src={operator.avatarUrl || undefined} alt={operator.fullName || "Operatore"} />
          <AvatarFallback className="bg-blue-900 text-lg font-bold text-blue-300">
            {getInitials(operator.fullName)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <Link href={`/operator/${operator.id}`} className="block">
            <h3 className="text-xl font-bold text-white transition-colors duration-300 group-hover:text-cyan-300">
              {operator.fullName}
            </h3>
          </Link>
          <p className="text-sm text-blue-300">{operator.headline}</p>
        </div>
      </div>

      <div className="my-4 flex items-center justify-between rounded-lg bg-slate-900/50 p-2">
        <div className="flex items-center space-x-2">
          <Star className="h-4 w-4 text-yellow-400" />
          <span className="text-sm font-semibold text-white">{operator.averageRating.toFixed(1)}</span>
          <span className="text-xs text-slate-400">({operator.reviewsCount} rec.)</span>
        </div>
        <Badge
          className={
            operator.isOnline
              ? "border-green-400/50 bg-green-500/20 text-green-300"
              : "border-slate-600/50 bg-slate-700/50 text-slate-300"
          }
        >
          {operator.isOnline ? "Online" : "Offline"}
        </Badge>
      </div>

      <p className="mb-4 flex-1 text-sm text-slate-300">{operator.bio}</p>

      <div className="mb-4 flex flex-wrap gap-2">
        {operator.specializations.slice(0, 3).map((spec) => (
          <Badge key={spec} variant="secondary" className="border-blue-600/50 bg-blue-900/70 text-blue-200">
            {spec}
          </Badge>
        ))}
      </div>

      <div className="mt-auto grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          size="sm"
          className="border-blue-700 bg-blue-950/50 text-blue-200 hover:border-blue-500 hover:bg-blue-900/80 hover:text-white"
          disabled={!operator.isOnline}
        >
          <MessageCircle className="mr-2 h-4 w-4" />
          {chatPrice ? `${chatPrice.toFixed(2)} €/min` : "Chat"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="border-blue-700 bg-blue-950/50 text-blue-200 hover:border-blue-500 hover:bg-blue-900/80 hover:text-white"
          disabled={!operator.isOnline}
        >
          <Phone className="mr-2 h-4 w-4" />
          {callPrice ? `${callPrice.toFixed(2)} €/min` : "Chiama"}
        </Button>
      </div>
      <Link href={`/operator/${operator.id}`} className="mt-4 block">
        <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg transition-all duration-300 hover:shadow-cyan-500/30">
          Vedi Profilo
          <Sparkles className="ml-2 h-4 w-4" />
        </Button>
      </Link>
    </div>
  )
}
