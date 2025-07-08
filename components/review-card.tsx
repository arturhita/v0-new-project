import { Star } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import { it } from "date-fns/locale"

export type Review = {
  id: string
  rating: number
  comment: string
  created_at: string
  client_username: string
  operator_name: string
}

interface ReviewCardProps {
  review: Review
}

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className={`w-5 h-5 ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-slate-600"}`} />
      ))}
    </div>
  )
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const timeAgo = formatDistanceToNow(new Date(review.created_at), { addSuffix: true, locale: it })

  return (
    <Card className="bg-slate-800/50 border-slate-700 text-white flex flex-col h-full">
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${review.client_username}`} />
            <AvatarFallback>{review.client_username.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg text-slate-200">{review.client_username}</CardTitle>
            <p className="text-sm text-slate-400">
              ha recensito <span className="font-semibold text-yellow-400">{review.operator_name}</span>
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col">
        <div className="flex justify-between items-center mb-2">
          <StarRating rating={review.rating} />
          <p className="text-xs text-slate-500">{timeAgo}</p>
        </div>
        <p className="text-slate-300 text-sm italic flex-grow">"{review.comment}"</p>
      </CardContent>
    </Card>
  )
}
