"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Star, Send } from "lucide-react"
import { createReview } from "@/lib/actions/reviews.actions"
import { toast } from "@/components/ui/use-toast"

interface ReviewFormProps {
  operatorId: string
  operatorName: string
  consultationId: string
  serviceType: "chat" | "call" | "email"
  onReviewSubmitted?: () => void
}

export function ReviewForm({
  operatorId,
  operatorName,
  consultationId,
  serviceType,
  onReviewSubmitted,
}: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (rating === 0) {
      toast({
        title: "Valutazione richiesta",
        description: "Seleziona una valutazione da 1 a 5 stelle",
        variant: "destructive",
      })
      return
    }

    if (comment.trim().length < 10) {
      toast({
        title: "Commento troppo breve",
        description: "Scrivi almeno 10 caratteri per il tuo commento",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const result = await createReview({
        userId: "current_user_id", // In produzione, prendere dall'auth
        operatorId,
        operatorName,
        userName: "Utente Corrente", // In produzione, prendere dall'auth
        userAvatar: "/placeholder.svg?height=40&width=40",
        rating,
        comment: comment.trim(),
        serviceType,
        consultationId,
        isVerified: true,
      })

      if (result.success) {
        toast({
          title: "Recensione inviata!",
          description: "La tua recensione è stata inviata e sarà pubblicata dopo la moderazione.",
          className: "bg-green-100 border-green-300 text-green-700",
        })

        // Reset form
        setRating(0)
        setComment("")
        onReviewSubmitted?.()
      }
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore nell'invio della recensione",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-sky-500/20">
      <CardHeader>
        <CardTitle className="text-xl text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-400">
          Lascia una Recensione per {operatorName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating Stars */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">La tua valutazione</label>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="p-1 transition-transform hover:scale-110"
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                >
                  <Star
                    className={`h-8 w-8 transition-colors ${
                      star <= (hoveredRating || rating)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-slate-600 hover:text-yellow-300"
                    }`}
                  />
                </button>
              ))}
              <span className="ml-3 text-sm text-slate-400">
                {rating > 0 && (
                  <>
                    {rating} stella{rating !== 1 ? "e" : ""} -{" "}
                    {rating === 1
                      ? "Pessimo"
                      : rating === 2
                        ? "Scarso"
                        : rating === 3
                          ? "Buono"
                          : rating === 4
                            ? "Molto buono"
                            : "Eccellente"}
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Comment */}
          <div>
            <label htmlFor="comment" className="block text-sm font-medium text-slate-300 mb-2">
              Il tuo commento
            </label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Condividi la tua esperienza con questo consulente..."
              className="min-h-[120px] bg-slate-800/50 border-sky-500/30 focus:border-sky-400 text-white resize-none"
              maxLength={500}
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-slate-400">Minimo 10 caratteri</span>
              <span className="text-xs text-slate-400">{comment.length}/500</span>
            </div>
          </div>

          {/* Service Type Badge */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">Tipo di consulenza:</span>
            <span className="px-2 py-1 bg-sky-500/20 text-sky-300 rounded-full text-xs font-medium">
              {serviceType === "chat" ? "💬 Chat" : serviceType === "call" ? "📞 Chiamata" : "📧 Email"}
            </span>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting || rating === 0}
            className="w-full bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Invio in corso...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Invia Recensione
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
