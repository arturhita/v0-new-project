import Link from "next/link"
import Image from "next/image"
import { Star, Phone, MessageSquare, Video } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { OperatorProfile } from "@/lib/actions/operator.actions"

interface OperatorCardProps {
  operator: OperatorProfile
}

export default function OperatorCard({ operator }: OperatorCardProps) {
  // Creiamo uno "slug" dal nome per usarlo nell'URL del profilo
  const operatorSlug = operator.full_name.toLowerCase().replace(/\s+/g, "-")

  return (
    <Card className="relative flex flex-col overflow-hidden rounded-2xl border-2 border-transparent bg-slate-800/50 p-0 shadow-lg transition-all duration-300 hover:border-purple-500 hover:shadow-purple-500/20">
      <div className="absolute top-3 right-3 z-10">
        <Badge
          variant="outline"
          className={`border-2 text-xs font-bold backdrop-blur-md ${
            operator.is_online
              ? "border-green-400 bg-green-500/20 text-green-300"
              : "border-slate-500 bg-slate-700/30 text-slate-300"
          }`}
        >
          <span className={`mr-2 h-2 w-2 rounded-full ${operator.is_online ? "bg-green-400" : "bg-slate-500"}`} />
          {operator.is_online ? "Online" : "Offline"}
        </Badge>
      </div>

      <Link href={`/operator/${operatorSlug}`} className="group block">
        <div className="relative h-56 w-full">
          <Image
            src={operator.avatar_url || "/placeholder.svg?width=400&height=400&text=Esperto"}
            alt={`Foto di ${operator.full_name}`}
            fill
            className="object-cover object-center transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        </div>
      </Link>

      <CardContent className="flex flex-1 flex-col p-4">
        <div className="flex-1">
          <Link href={`/operator/${operatorSlug}`}>
            <h3 className="text-xl font-bold text-white transition-colors hover:text-purple-400">
              {operator.full_name}
            </h3>
          </Link>
          <p className="mt-1 text-sm font-medium text-purple-300">{operator.headline}</p>

          <div className="mt-3 flex items-center gap-2 text-yellow-400">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${i < Math.round(operator.average_rating) ? "fill-current" : "text-slate-500"}`}
                />
              ))}
            </div>
            <span className="text-sm font-bold text-white">{operator.average_rating.toFixed(1)}</span>
            <span className="text-xs text-slate-400">({operator.total_reviews} recensioni)</span>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {operator.specializations.slice(0, 3).map((spec) => (
              <Badge key={spec} variant="secondary" className="bg-slate-700 text-slate-300">
                {spec}
              </Badge>
            ))}
          </div>
        </div>

        <div className="mt-4 border-t border-slate-700 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-slate-400">
              <Phone className="h-5 w-5" />
              <MessageSquare className="h-5 w-5" />
              <Video className="h-5 w-5" />
            </div>
            <Button
              asChild
              size="sm"
              className="bg-purple-600 text-white hover:bg-purple-500"
              disabled={!operator.is_online}
            >
              <Link href={`/chat/${operator.id}`}>Contatta</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
