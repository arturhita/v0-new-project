import { Star } from "lucide-react"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { it } from "date-fns/locale"

interface Review {
  id: string
  rating: number
  comment: string | null
  created_at: string
  client_name: string
  client_avatar_url: string | null
}

interface ReviewCardProps {
  review: Review
}

const RatingStars = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className={`w-4 h-4 ${i < rating ? "text-yellow-400" : "text-gray-500"}`} fill="currentColor" />
      ))}
    </div>
  )
}

export function ReviewCard({ review }: ReviewCardProps) {
  const timeAgo = formatDistanceToNow(new Date(review.created_at), { addSuffix: true, locale: it })

  return (
    <div className="flex items-start space-x-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
      <div className="relative w-10 h-10 flex-shrink-0">
        <Image
          src={review.client_avatar_url || "/images/placeholder.svg?width=40&height=40"}
          alt={`Avatar di ${review.client_name}`}
          layout="fill"
          objectFit="cover"
          className="rounded-full"
        />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-slate-100">{review.client_name}</h4>
          <span className="text-xs text-slate-400">{timeAgo}</span>
        </div>
        <RatingStars rating={review.rating} />
        <p className="mt-2 text-slate-300 text-sm">{review.comment}</p>
      </div>
    </div>
  )
}
