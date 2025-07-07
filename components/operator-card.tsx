import Image from "next/image"
import Link from "next/link"
import { Phone, MessageSquare, Star, Circle } from "lucide-react"
import type { OperatorCardData } from "@/lib/actions/operator.actions"
import { Badge } from "@/components/ui/badge"

interface OperatorCardProps {
  operator: OperatorCardData
}

export function OperatorCard({ operator }: OperatorCardProps) {
  const getService = (type: "chat" | "call" | "email") => operator.services.find((s) => s.type === type)

  const chatService = getService("chat")
  const callService = getService("call")

  return (
    <div className="relative bg-gradient-to-br from-[#1a1a3d] to-[#10102a] rounded-lg overflow-hidden border border-purple-800/50 shadow-lg transition-all duration-300 hover:shadow-purple-500/20 hover:-translate-y-1">
      {operator.isOnline && (
        <div className="absolute top-3 right-3 flex items-center gap-2 bg-green-500/20 text-green-300 px-2 py-1 rounded-full text-xs font-bold border border-green-400/50">
          <Circle fill="currentColor" className="w-2 h-2" />
          <span>Online</span>
        </div>
      )}
      <Link href={`/operator/${operator.id}`} className="block">
        <div className="relative h-48">
          <Image
            src={operator.avatarUrl || "/placeholder.svg?width=400&height=400"}
            alt={operator.fullName || "Operatore"}
            layout="fill"
            objectFit="cover"
            className="opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#10102a] to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-4">
            <h3 className="text-2xl font-bold text-white text-shadow-gold">{operator.fullName || "Nome Operatore"}</h3>
            <p className="text-purple-300 font-medium">{operator.headline || "Specializzazione principale"}</p>
          </div>
        </div>
      </Link>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1 text-yellow-400">
            <Star className="w-5 h-5" fill="currentColor" />
            <span className="font-bold text-white">{operator.averageRating.toFixed(1)}</span>
            <span className="text-gray-400 text-sm">({operator.reviewsCount} rec.)</span>
          </div>
          <div className="flex gap-2">
            {chatService && <MessageSquare className="w-5 h-5 text-gray-300" />}
            {callService && <Phone className="w-5 h-5 text-gray-300" />}
          </div>
        </div>
        <p className="text-gray-300 text-sm h-10 mb-3 overflow-hidden">
          {operator.bio || "Nessuna biografia disponibile."}
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          {(operator.specializations || []).slice(0, 3).map((spec) => (
            <Badge key={spec} variant="secondary" className="bg-purple-500/10 text-purple-300 border-purple-500/20">
              {spec}
            </Badge>
          ))}
        </div>
        <div className="flex justify-between items-center text-sm">
          {chatService?.price != null && (
            <div className="text-center">
              <p className="text-gray-400">Chat</p>
              <p className="font-bold text-white">{chatService.price}€/min</p>
            </div>
          )}
          {callService?.price != null && (
            <div className="text-center">
              <p className="text-gray-400">Telefono</p>
              <p className="font-bold text-white">{callService.price}€/min</p>
            </div>
          )}
        </div>
      </div>
      <Link
        href={`/chat/${operator.id}`}
        className="block w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-center p-3 font-bold text-white hover:from-purple-600 hover:to-indigo-700 transition-colors duration-300"
      >
        Inizia a Chattare
      </Link>
    </div>
  )
}
