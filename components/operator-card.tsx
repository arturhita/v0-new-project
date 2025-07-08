import Link from "next/link"
import Image from "next/image"
import { Star, Phone, MessageSquare, Video } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export type Operator = {
  id: string
  username: string
  profile_picture_url: string | null
  specializations: string[]
  average_rating: number | null
  total_reviews: number
  is_online: boolean
  is_new?: boolean
}

interface OperatorCardProps {
  operator: Operator
  showNewBadge?: boolean
}

export default function OperatorCard({ operator, showNewBadge = false }: OperatorCardProps) {
  const { username, profile_picture_url, specializations, average_rating, total_reviews, is_online, is_new } = operator

  return (
    <Card className="relative flex flex-col bg-slate-800/50 border-slate-700 text-white overflow-hidden shadow-lg hover:shadow-yellow-400/20 transition-shadow duration-300 group">
      {is_online && (
        <div className="absolute top-3 right-3 flex items-center gap-2 bg-green-500/20 border border-green-400 text-green-300 text-xs font-bold px-2 py-1 rounded-full z-10">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          Online
        </div>
      )}
      {showNewBadge && is_new && (
        <Badge variant="destructive" className="absolute top-3 left-3 z-10 bg-yellow-400 text-slate-900 font-bold">
          NUOVO
        </Badge>
      )}
      <CardHeader className="p-0">
        <Link href={`/operator/${username}`} className="block aspect-square relative overflow-hidden">
          <Image
            src={profile_picture_url || "/images/mystical-moon.png"}
            alt={`Profilo di ${username}`}
            width={300}
            height={300}
            className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
        </Link>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-xl font-bold text-yellow-400 hover:text-yellow-300 transition-colors">
          <Link href={`/operator/${username}`}>{username}</Link>
        </CardTitle>
        <div className="flex items-center gap-2 text-sm text-slate-300 mt-1">
          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          <span>{average_rating ? average_rating.toFixed(1) : "N/A"}</span>
          <span className="text-slate-400">({total_reviews} recensioni)</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {specializations?.slice(0, 3).map((spec) => (
            <Badge key={spec} variant="secondary" className="bg-slate-700 text-slate-300 border-slate-600">
              {spec}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex flex-col items-stretch gap-2">
        <Button
          asChild
          className={cn(
            "w-full font-bold",
            is_online ? "bg-green-600 hover:bg-green-700" : "bg-slate-600 hover:bg-slate-700 cursor-not-allowed",
          )}
        >
          <Link href={is_online ? `/chat/new?operator=${operator.id}` : "#"}>
            <MessageSquare className="w-4 h-4 mr-2" />
            Chatta Ora
          </Link>
        </Button>
        <div className="flex gap-2 justify-center text-slate-400">
          <Phone className="w-5 h-5" />
          <Video className="w-5 h-5" />
        </div>
      </CardFooter>
    </Card>
  )
}
