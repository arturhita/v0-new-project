import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star } from "lucide-react"
import type { Profile } from "@/contexts/auth-context"

interface OperatorCardProps {
  operator: Profile
  showNewBadge?: boolean
}

export function OperatorCard({ operator, showNewBadge = false }: OperatorCardProps) {
  const averageRating = operator.average_rating ?? 0
  const specializations = operator.specializations ?? []
  const servicePrices = operator.service_prices as { chat?: number; call?: number } | null

  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-slate-800/50 border border-slate-700 text-white">
      <CardHeader className="p-0 relative">
        <Link href={`/operator/${operator.stage_name}`} className="block">
          <Image
            src={operator.profile_image_url || "/placeholder.svg?height=200&width=300&query=mystical"}
            alt={`Foto di ${operator.stage_name}`}
            width={300}
            height={200}
            className="w-full h-48 object-cover"
          />
        </Link>
        {operator.is_available && (
          <div className="absolute top-2 right-2 flex items-center bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
            <span className="w-2 h-2 bg-white rounded-full mr-1.5 animate-pulse"></span>
            Online
          </div>
        )}
        {showNewBadge && (
          <div className="absolute top-2 left-2 flex items-center bg-yellow-500 text-slate-900 text-xs font-bold px-2 py-1 rounded-full shadow-lg">
            NUOVO
          </div>
        )}
      </CardHeader>
      <CardContent className="pt-4 flex-grow">
        <Link href={`/operator/${operator.stage_name}`}>
          <CardTitle className="text-xl font-bold text-white hover:text-purple-300 transition-colors">
            {operator.stage_name}
          </CardTitle>
        </Link>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex items-center gap-1 text-yellow-400">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-sm font-semibold text-slate-300">{averageRating.toFixed(1)}</span>
          </div>
          <span className="text-xs text-slate-400">({operator.review_count} rec.)</span>
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {specializations.slice(0, 2).map((spec) => (
            <Badge key={spec} variant="secondary" className="bg-slate-700 text-slate-300">
              {spec}
            </Badge>
          ))}
        </div>
        <p className="mt-3 text-sm text-slate-400 line-clamp-2 h-10">{operator.bio}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center pt-2 border-t border-slate-700 mt-auto">
        <div className="flex flex-col">
          {servicePrices?.chat && (
            <span className="text-sm font-bold text-white">{servicePrices.chat.toFixed(2)}€/min</span>
          )}
          <span className="text-xs text-slate-400">in chat</span>
        </div>
        <Button asChild className="bg-purple-600 hover:bg-purple-700 text-white rounded-full">
          <Link href={`/operator/${operator.stage_name}`}>Profilo</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
