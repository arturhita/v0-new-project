import { Star } from "lucide-react"
import Image from "next/image"
import { cn, formatDate } from "@/lib/utils"
import type { Review } from "@/types/database"

interface ReviewCardProps {
  review: Review
}

export default function ReviewCard({ review }: ReviewCardProps) {
  return (
    <div className="flex items-start gap-4">
      <Image
        src={review.client?.avatar_url || "/placeholder.svg?width=40&height=40&query=user+avatar"}
        alt={review.client?.full_name || "Cliente"}
        width={40}
        height={40}
        className="rounded-full"
      />
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-gray-800">{review.client?.full_name || "Cliente Anonimo"}</p>
          <p className="text-xs text-gray-500">{formatDate(review.created_at)}</p>
        </div>
        <div className="flex items-center gap-1 mt-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={cn("h-4 w-4", i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300")}
            />
          ))}
        </div>
        <p className="text-gray-600 mt-2 text-sm">{review.comment}</p>
      </div>
    </div>
  )
}
