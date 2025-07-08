import Image from "next/image"
import Link from "next/link"
import { Star, Phone, MessageSquare, Mail } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export type Operator = {
  id: string
  name: string
  avatarUrl: string | null
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

interface OperatorCardProps {
  operator: Operator
  showNewBadge?: boolean
}

export default function OperatorCard({ operator, showNewBadge = false }: OperatorCardProps) {
  const timeSinceJoined = operator.joinedDate ? Date.now() - new Date(operator.joinedDate).getTime() : 0
  const isNew = timeSinceJoined < 7 * 24 * 60 * 60 * 1000 // Less than 7 days

  return (
    <div
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border-2 bg-slate-800/50 shadow-lg transition-all duration-300 hover:shadow-blue-500/20 hover:border-blue-500",
        operator.isOnline ? "border-green-500/50" : "border-slate-700/50",
      )}
    >
      {showNewBadge && isNew && (
        <Badge className="absolute top-3 right-3 z-10 bg-yellow-400 text-slate-900 font-bold">NUOVO</Badge>
      )}
      <div className="relative">
        <Image
          src={operator.avatarUrl || `/placeholder.svg?width=400&height=400&query=${operator.name}`}
          alt={`Ritratto di ${operator.name}`}
          width={400}
          height={400}
          className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 flex items-center justify-center gap-2 p-2 text-sm font-bold text-white",
            operator.isOnline ? "bg-green-600/80" : "bg-slate-600/80",
          )}
        >
          {operator.isOnline ? "ONLINE" : "OFFLINE"}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-xl font-bold text-white">{operator.name}</h3>
        <p className="text-sm text-yellow-400">{operator.specialization}</p>
        <div className="my-2 flex items-center gap-2 text-sm text-slate-300">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span>
            {operator.rating.toFixed(1)} ({operator.reviewsCount} recensioni)
          </span>
        </div>
        <p className="mb-3 text-sm text-slate-400 flex-1">{operator.description.substring(0, 80)}...</p>
        <div className="mb-4 flex flex-wrap gap-2">
          {operator.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="bg-blue-900/50 text-blue-300 border-blue-700">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="mt-auto flex flex-col gap-2">
          <Link href={`/operator/${operator.name.toLowerCase().replace(/\s+/g, "-")}`} passHref>
            <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700">
              Vedi Profilo
            </Button>
          </Link>
          <div className="flex justify-center gap-3 text-slate-300">
            {operator.services.chatPrice && <MessageSquare className="h-5 w-5" title="Chat disponibile" />}
            {operator.services.callPrice && <Phone className="h-5 w-5" title="Chiamata disponibile" />}
            {operator.services.emailPrice && <Mail className="h-5 w-5" title="Consulto scritto disponibile" />}
          </div>
        </div>
      </div>
    </div>
  )
}
