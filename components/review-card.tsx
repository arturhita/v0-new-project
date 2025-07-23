import { Star } from "lucide-react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"

export interface Review {
  id: string
  rating: number
  comment: string
  created_at: string
  user_name: string
  user_avatar_url: string | null
  service_type: "chat" | "call" | "written" | "email"
}

export const ReviewCard = ({ review }: { review: Review }) => {
  const serviceMap = {
    chat: { label: "Chat", color: "bg-green-500/20 text-green-300 border-green-400/30" },
    call: { label: "Chiamata", color: "bg-blue-500/20 text-blue-300 border-blue-400/30" },
    written: { label: "Consulto Scritto", color: "bg-purple-500/20 text-purple-300 border-purple-400/30" },
    email: { label: "Consulto Email", color: "bg-purple-500/20 text-purple-300 border-purple-400/30" },
  }

  const serviceInfo = serviceMap[review.service_type] || {
    label: review.service_type,
    color: "bg-gray-500/20 text-gray-300 border-gray-400/30",
  }

  return (
    <div className="border-t border-white/10 pt-6 first:border-t-0 first:pt-0">
      <div className="flex items-start space-x-4">
        <div className="relative w-10 h-10 flex-shrink-0">
          <Image
            src={review.user_avatar_url || "/placeholder.svg?width=40&height=40&query=user+avatar"}
            alt={`Avatar di ${review.user_name}`}
            fill
            className="rounded-full object-cover"
          />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-white">{review.user_name}</p>
              <p className="text-xs text-blue-300">
                {new Date(review.created_at).toLocaleDateString("it-IT", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 transition-colors duration-300 ${
                    i < review.rating ? "text-sky-400 fill-sky-400" : "text-slate-600"
                  }`}
                />
              ))}
            </div>
          </div>
          <p className="mt-3 text-blue-200 italic">"{review.comment}"</p>
          <Badge className={`mt-3 text-xs border ${serviceInfo.color}`}>{serviceInfo.label}</Badge>
        </div>
      </div>
    </div>
  )
}
