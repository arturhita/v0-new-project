import { Star } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import { it } from "date-fns/locale"
import type { Review as ReviewType } from "@/types/database" // Using the main database type

interface ReviewCardProps {
  review: ReviewType
  variant?: "dark" | "light"
}

export function ReviewCard({ review, variant = "dark" }: ReviewCardProps) {
  let timeAgo = "Data non disponibile"
  try {
    if (review.created_at) {
      const date = new Date(review.created_at)
      if (!isNaN(date.getTime())) {
        timeAgo = formatDistanceToNow(date, { addSuffix: true, locale: it })
      }
    }
  } catch (error) {
    console.error("Error formatting date in ReviewCard:", error)
  }

  const clientName = review.client?.full_name || "Utente Anonimo"
  const clientInitial = clientName.charAt(0).toUpperCase()
  const isDark = variant === "dark"

  return (
    <div
      className={
        isDark
          ? "bg-slate-800/50 p-6 rounded-xl border border-slate-700/50 h-full flex flex-col text-white"
          : "bg-white p-6 rounded-xl border border-gray-200 h-full flex flex-col"
      }
    >
      <div className="flex items-start mb-4 gap-4">
        <Avatar className="h-10 w-10">
          <AvatarFallback className={isDark ? "bg-slate-700 text-slate-300" : "bg-gray-100 text-gray-600"}>
            {clientInitial}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className={isDark ? "font-semibold" : "font-semibold text-gray-900"}>{clientName}</p>
          {review.operator?.stage_name && (
            <p className={isDark ? "text-xs text-slate-400" : "text-xs text-gray-500"}>
              per{" "}
              <span className={isDark ? "font-medium text-amber-300" : "font-medium text-indigo-600"}>
                {review.operator.stage_name}
              </span>
            </p>
          )}
        </div>
        <div className="flex items-center shrink-0">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-5 w-5 ${
                i < review.rating ? "text-yellow-400 fill-yellow-400" : isDark ? "text-slate-600" : "text-gray-300"
              }`}
            />
          ))}
        </div>
      </div>
      <p
        className={
          isDark
            ? "text-slate-300 text-sm leading-relaxed flex-1 mb-4"
            : "text-gray-600 text-sm leading-relaxed flex-1 mb-4"
        }
      >
        "{review.comment}"
      </p>
      <p className={isDark ? "text-right text-xs text-slate-500" : "text-right text-xs text-gray-500"}>{timeAgo}</p>
    </div>
  )
}
