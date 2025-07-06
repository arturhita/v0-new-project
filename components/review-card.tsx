import { Star } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import { it } from "date-fns/locale"
import type { Review } from "@/types/review.types"

interface ReviewCardProps {
  review: Review
}

export function ReviewCard({ review }: ReviewCardProps) {
  let timeAgo = "Data non disponibile"
  try {
    // Aggiungiamo un controllo per assicurarci che la data esista e sia valida
    if (review.created_at) {
      const date = new Date(review.created_at)
      if (!isNaN(date.getTime())) {
        timeAgo = formatDistanceToNow(date, { addSuffix: true, locale: it })
      }
    }
  } catch (error) {
    console.error("Error formatting date in ReviewCard:", error)
  }

  return (
    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50 h-full flex flex-col">
      <div className="flex items-center mb-4">
        <Avatar className="h-10 w-10 mr-4">
          <AvatarFallback>{review.user_full_name?.charAt(0) || "U"}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="font-semibold text-white">{review.user_full_name || "Utente"}</p>
          <p className="text-xs text-slate-400">{timeAgo}</p>
        </div>
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-5 w-5 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-600"}`}
            />
          ))}
        </div>
      </div>
      <p className="text-slate-300 text-sm leading-relaxed flex-1">{review.comment}</p>
    </div>
  )
}
