"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Star, CheckCircle, XCircle, MessageCircle, Loader2 } from "lucide-react"
import type { PendingReview } from "@/lib/actions/reviews.actions"
import { approveReview, rejectReview } from "@/lib/actions/reviews.actions"
import { useToast } from "@/hooks/use-toast"

interface ReviewModerationClientProps {
  initialReviews: PendingReview[]
}

export function ReviewModerationClient({ initialReviews }: ReviewModerationClientProps) {
  const [reviews, setReviews] = useState<PendingReview[]>(initialReviews)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const handleReviewAction = (reviewId: string, action: "approve" | "reject") => {
    startTransition(async () => {
      const result = action === "approve" ? await approveReview(reviewId) : await rejectReview(reviewId)

      if (result.success) {
        toast({
          title: "Successo",
          description: result.message,
        })
        setReviews((prev) => prev.filter((rev) => rev.id !== reviewId))
      } else {
        toast({
          title: "Errore",
          description: result.message,
          variant: "destructive",
        })
      }
    })
  }

  if (reviews.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-slate-500">
          Nessuna recensione in attesa di moderazione. Ottimo lavoro!
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {reviews.map((rev) => (
        <Card key={rev.id} className="shadow-lg rounded-xl">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center">
              <CardTitle className="text-lg text-slate-700 flex items-center">
                <MessageCircle className="h-5 w-5 mr-2 text-[hsl(var(--primary-medium))]" />
                Recensione per {rev.operatorName || "Operatore non specificato"}
              </CardTitle>
              <div className="flex items-center gap-1 mt-1 sm:mt-0">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${i < rev.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-300"}`}
                  />
                ))}
                <span className="ml-1 text-sm text-slate-600">({rev.rating}/5)</span>
              </div>
            </div>
            <CardDescription className="text-sm text-slate-500 pt-1">
              Da: {rev.clientName || "Utente Anonimo"} - Data: {new Date(rev.createdAt).toLocaleDateString("it-IT")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-4 bg-slate-50 p-3 rounded-md">{rev.comment}</p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={() => handleReviewAction(rev.id, "approve")}
                className="bg-emerald-500 hover:bg-emerald-600 text-white"
                disabled={isPending}
              >
                {isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="mr-2 h-4 w-4" />
                )}
                Approva e Pubblica
              </Button>
              <Button
                onClick={() => handleReviewAction(rev.id, "reject")}
                variant="destructive"
                className="bg-red-500 hover:bg-red-600 text-white"
                disabled={isPending}
              >
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
                Rifiuta Recensione
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
