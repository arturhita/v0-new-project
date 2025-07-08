import { Star } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { it } from "date-fns/locale"

export type Review = {
  id: string
  userName: string
  userType: "Vip" | "Utente"
  operatorName: string
  rating: number
  comment: string
  date: string
}

interface ReviewCardProps {
  review: Review
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const timeAgo = formatDistanceToNow(new Date(review.date), { addSuffix: true, locale: it })

  return (
    <div className="flex h-full flex-col rounded-2xl border-2 border-slate-700/50 bg-slate-800/50 p-6 shadow-lg transition-all duration-300 hover:border-yellow-400/50 hover:shadow-yellow-400/10">
      <div className="mb-4 flex items-center">
        <Avatar className="h-12 w-12 border-2 border-yellow-400">
          <AvatarImage src={`/placeholder.svg?width=48&height=48&query=${review.userName}`} />
          <AvatarFallback>{review.userName.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="ml-4">
          <p className="font-bold text-white">{review.userName}</p>
          <p className="text-sm text-slate-400">
            per <span className="font-semibold text-yellow-300">{review.operatorName}</span>
          </p>
        </div>
        {review.userType === "Vip" && <Badge className="ml-auto bg-purple-600 text-white">VIP</Badge>}
      </div>
      <div className="mb-3 flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-5 w-5 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-slate-500"}`}
          />
        ))}
      </div>
      <p className="text-slate-300 flex-1 text-base leading-relaxed">"{review.comment}"</p>
      <p className="mt-4 text-right text-xs text-slate-500">{timeAgo}</p>
    </div>
  )
}
