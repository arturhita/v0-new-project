import Link from "next/link"
import { Star, Phone, MessageSquare, Mail, BadgeCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { OperatorCardData } from "@/lib/actions/operator.actions"

interface OperatorCardProps {
  operator: OperatorCardData
  showNewBadge?: boolean
}

export function OperatorCard({ operator, showNewBadge = false }: OperatorCardProps) {
  const getServicePrice = (type: "chat" | "call" | "email") => {
    const service = operator.services.find((s) => s.type === type)
    return service ? service.price : null
  }

  const chatPrice = getServicePrice("chat")
  const callPrice = getServicePrice("call")
  const emailPrice = getServicePrice("email")

  return (
    <div className="group relative flex h-full w-full flex-col overflow-hidden rounded-2xl border border-blue-800/50 bg-gradient-to-br from-slate-900/80 to-blue-950/70 p-5 shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-yellow-400/50 hover:shadow-yellow-400/10 hover:-translate-y-1">
      {showNewBadge && <Badge className="absolute top-3 right-3 bg-yellow-400 text-slate-900 font-bold">NUOVO</Badge>}
      <div className="flex items-center space-x-4">
        <div className="relative">
          <img
            src={operator.avatarUrl || "/placeholder.svg?width=80&height=80"}
            alt={`Profilo di ${operator.fullName || "Operatore"}`}
            width={80}
            height={80}
            className="rounded-full border-2 border-blue-600 object-cover"
          />
          {operator.isOnline && (
            <span className="absolute bottom-0 right-0 block h-4 w-4 rounded-full border-2 border-slate-900 bg-green-500 shadow-md" />
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white">{operator.fullName || "Nome Operatore"}</h3>
          <p className="text-sm text-blue-300">{operator.headline || "Specializzazione"}</p>
          <div className="mt-1 flex items-center space-x-1">
            <Star className="h-4 w-4 text-yellow-400" fill="currentColor" />
            <span className="text-sm font-semibold text-white">{operator.averageRating.toFixed(1)}</span>
            <span className="text-xs text-slate-400">({operator.reviewsCount} recensioni)</span>
          </div>
        </div>
      </div>

      <p className="mt-4 flex-1 text-sm text-slate-300">{operator.bio || "Nessuna biografia disponibile."}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {operator.specializations.slice(0, 3).map((tag) => (
          <Badge key={tag} variant="secondary" className="bg-blue-800/50 text-blue-200">
            {tag}
          </Badge>
        ))}
      </div>

      <div className="my-4 h-px bg-blue-800/50" />

      <div className="flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          {chatPrice !== null && <MessageSquare className="h-4 w-4 text-green-400" />}
          {callPrice !== null && <Phone className="h-4 w-4 text-sky-400" />}
          {emailPrice !== null && <Mail className="h-4 w-4 text-purple-400" />}
        </div>
        <div className="flex items-center gap-1">
          <BadgeCheck className="h-4 w-4 text-green-500" />
          <span>Verificato</span>
        </div>
      </div>

      <Link href={`/operator/${operator.id}`} passHref>
        <Button className="mt-4 w-full rounded-full bg-gradient-to-r from-blue-600 to-purple-600 font-semibold text-white transition-all duration-300 group-hover:from-yellow-500 group-hover:to-orange-500 group-hover:text-slate-900">
          Vedi Profilo
        </Button>
      </Link>
    </div>
  )
}
