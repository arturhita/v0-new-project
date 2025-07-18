"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Star, CheckCircle, XCircle, MessageCircle } from "lucide-react"
import { moderateReview } from "@/lib/actions/reviews.actions"
import { useToast } from "@/components/ui/use-toast"
import { useState } from "react"

// I dati della recensione arrivano dalla pagina server
export interface Review {
  id: string
  user_name: string
  operator_name: string
  rating: number
  comment: string
  created_at: string
  status: "Pending" | "Approved" | "Rejected"
}

interface ReviewModerationCardProps {
  review: Review
}

export function ReviewModerationCard({ review }: ReviewModerationCardProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()

  const handleReviewAction = async (approved: boolean) => {
    setIsProcessing(true)
    const result = await moderateReview(review.id, approved)
    setIsProcessing(false)

    if (result.success) {
      toast({
        title: "Azione completata",
        description: `Recensione ${approved ? "approvata e pubblicata" : "rifiutata"}. La pagina si aggiornerà.`,
        className: "bg-green-100 border-green-300 text-green-700",
      })
    } else {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la moderazione.",
        variant: "destructive",
      })
    }
  }

  return (
    <Card className="shadow-lg rounded-xl">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center">
          <CardTitle className="text-lg text-slate-700 flex items-center">
            <MessageCircle className="h-5 w-5 mr-2 text-[hsl(var(--primary-medium))]" />
            Recensione per {review.operator_name}
          </CardTitle>
          <div className="flex items-center gap-1 mt-1 sm:mt-0">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-5 w-5 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-300"}`}
              />
            ))}
            <span className="ml-1 text-sm text-slate-600">({review.rating}/5)</span>
          </div>
        </div>
        <CardDescription className="text-sm text-slate-500 pt-1">
          Da: {review.user_name} - Data: {new Date(review.created_at).toLocaleDateString("it-IT")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-600 mb-4 bg-slate-50 p-3 rounded-md">{review.comment}</p>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={() => handleReviewAction(true)}
            disabled={isProcessing}
            className="bg-emerald-500 hover:bg-emerald-600 text-white"
          >
            <CheckCircle className="mr-2 h-4 w-4" /> {isProcessing ? "Processando..." : "Approva e Pubblica"}
          </Button>
          <Button
            onClick={() => handleReviewAction(false)}
            disabled={isProcessing}
            variant="destructive"
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            <XCircle className="mr-2 h-4 w-4" /> {isProcessing ? "Processando..." : "Rifiuta Recensione"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
