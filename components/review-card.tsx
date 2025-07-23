import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, MessageCircle, Phone, Mail } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { it } from "date-fns/locale"

export type Review = {
  id: string
  user_name: string
  user_avatar_url?: string | null
  operator_name: string
  rating: number
  comment: string
  created_at: string
  service_type?: "chat" | "call" | "written" | string
}

const ServiceIcon = ({ type }: { type?: string }) => {
  switch (type) {
    case "chat":
      return <MessageCircle className="h-4 w-4 text-gray-400" />
    case "call":
      return <Phone className="h-4 w-4 text-gray-400" />
    case "written":
      return <Mail className="h-4 w-4 text-gray-400" />
    default:
      return null
  }
}

export const ReviewCard = ({ review }: { review: Review }) => {
  const timeAgo = formatDistanceToNow(new Date(review.created_at), {
    addSuffix: true,
    locale: it,
  })

  return (
    <Card className="w-full max-w-md bg-slate-900/50 border-indigo-400/20 text-white flex flex-col h-full">
      <CardHeader className="flex flex-row items-center gap-4 p-4">
        <Avatar>
          <AvatarImage src={review.user_avatar_url ?? undefined} alt={review.user_name} />
          <AvatarFallback>{review.user_name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="font-semibold text-indigo-300">{review.user_name}</p>
          <p className="text-xs text-gray-400">
            ha recensito <span className="font-medium text-amber-300">{review.operator_name}</span>
          </p>
        </div>
        <div className="flex items-center gap-1 text-amber-400">
          <Star className="h-5 w-5 fill-current" />
          <span className="font-bold text-lg">{review.rating}</span>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 flex-grow">
        <p className="text-gray-300 italic">"{review.comment}"</p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center text-xs text-gray-400">
        <span>{timeAgo}</span>
        <div className="flex items-center gap-1">
          <ServiceIcon type={review.service_type} />
          <span className="capitalize">{review.service_type || "Consulto"}</span>
        </div>
      </CardFooter>
    </Card>
  )
}
