"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { approveReview, rejectReview } from "@/lib/actions/reviews.actions"
import { getInitials } from "@/lib/utils"
import { Star, ThumbsDown, ThumbsUp } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export function ReviewModerationCard({ review }: { review: any }) {
  const { toast } = useToast()

  const handleApprove = async () => {
    const result = await approveReview(review.id)
    if (result.success) {
      toast({ title: "Recensione Approvata" })
    } else {
      toast({ title: "Errore", description: result.message, variant: "destructive" })
    }
  }

  const handleReject = async () => {
    const result = await rejectReview(review.id)
    if (result.success) {
      toast({ title: "Recensione Rifiutata" })
    } else {
      toast({ title: "Errore", description: result.message, variant: "destructive" })
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start gap-4">
        <Avatar>
          <AvatarImage src={review.client.avatar_url ?? undefined} />
          <AvatarFallback>{getInitials(review.client.full_name)}</AvatarFallback>
        </Avatar>
        <div>
          <CardTitle className="text-lg">{review.client.full_name}</CardTitle>
          <p className="text-sm text-muted-foreground">
            Recensione per <strong>{review.operator.full_name}</strong>
          </p>
          <div className="flex items-center gap-1 mt-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-5 w-5 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
              />
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="italic">"{review.comment}"</p>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={handleReject}>
          <ThumbsDown className="mr-2 h-4 w-4" />
          Rifiuta
        </Button>
        <Button size="sm" onClick={handleApprove} className="bg-green-600 hover:bg-green-700">
          <ThumbsUp className="mr-2 h-4 w-4" />
          Approva
        </Button>
      </CardFooter>
    </Card>
  )
}
