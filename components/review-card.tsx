import { Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export interface Review {
  id: string | number
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

function timeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  let interval = seconds / 31536000
  if (interval > 1) {
    return Math.floor(interval) + " anni fa"
  }
  interval = seconds / 2592000
  if (interval > 1) {
    return Math.floor(interval) + " mesi fa"
  }
  interval = seconds / 86400
  if (interval > 1) {
    return Math.floor(interval) + " giorni fa"
  }
  interval = seconds / 3600
  if (interval > 1) {
    return Math.floor(interval) + " ore fa"
  }
  interval = seconds / 60
  if (interval > 1) {
    return Math.floor(interval) + " minuti fa"
  }
  return "Pochi istanti fa"
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-blue-800/50 bg-gradient-to-br from-slate-900/80 to-blue-950/70 p-6 shadow-lg backdrop-blur-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-bold text-white">{review.userName}</p>
          {review.userType === "Vip" && <Badge className="mt-1 bg-yellow-400 text-slate-900">Utente VIP</Badge>}
        </div>
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-5 w-5 ${i < review.rating ? "text-yellow-400" : "text-slate-600"}`}
              fill="currentColor"
            />
          ))}
        </div>
      </div>
      <p className="my-4 flex-1 text-sm italic text-slate-300">"{review.comment}"</p>
      <div className="text-right text-xs text-slate-500">
        per <span className="font-semibold text-blue-400">{review.operatorName}</span> - {timeAgo(review.date)}
      </div>
    </div>
  )
}
