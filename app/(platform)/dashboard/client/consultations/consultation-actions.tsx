"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Star, X } from "lucide-react"
import { updateConsultationRating, cancelConsultation } from "@/lib/actions/consultations.actions"
import { toast } from "sonner"
import type { Consultation } from "@/lib/actions/consultations.actions"

interface ConsultationActionsProps {
  consultation: Consultation
}

export default function ConsultationActions({ consultation }: ConsultationActionsProps) {
  const [rating, setRating] = useState(consultation.rating || 0)
  const [reviewText, setReviewText] = useState(consultation.reviewText || "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [isRatingOpen, setIsRatingOpen] = useState(false)

  const handleRatingSubmit = async () => {
    if (rating === 0) {
      toast.error("Seleziona una valutazione")
      return
    }

    setIsSubmitting(true)
    try {
      const result = await updateConsultationRating(consultation.id, rating, reviewText)
      if (result.success) {
        toast.success("Valutazione salvata con successo!")
        setIsRatingOpen(false)
        // Refresh the page to show updated data
        window.location.reload()
      } else {
        toast.error("Errore nel salvare la valutazione")
      }
    } catch (error) {
      toast.error("Errore nel salvare la valutazione")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = async () => {
    setIsCancelling(true)
    try {
      const result = await cancelConsultation(consultation.id)
      if (result.success) {
        toast.success("Consulenza annullata con successo!")
        // Refresh the page to show updated data
        window.location.reload()
      } else {
        toast.error("Errore nell'annullare la consulenza")
      }
    } catch (error) {
      toast.error("Errore nell'annullare la consulenza")
    } finally {
      setIsCancelling(false)
    }
  }

  const canRate = consultation.status === "completed" && !consultation.rating
  const canCancel = consultation.status === "scheduled"

  if (!canRate && !canCancel) {
    return null
  }

  return (
    <div className="flex gap-2 pt-2 border-t">
      {canRate && (
        <Dialog open={isRatingOpen} onOpenChange={setIsRatingOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Star className="h-4 w-4 mr-2" />
              Valuta
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Valuta la consulenza</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Valutazione</Label>
                <div className="flex space-x-1 mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type="button" onClick={() => setRating(star)} className="focus:outline-none">
                      <Star
                        className={`h-6 w-6 ${star <= rating ? "text-yellow-500 fill-current" : "text-gray-300"}`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="review">Recensione (opzionale)</Label>
                <Textarea
                  id="review"
                  placeholder="Scrivi la tua recensione..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="mt-2"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsRatingOpen(false)}>
                  Annulla
                </Button>
                <Button onClick={handleRatingSubmit} disabled={isSubmitting || rating === 0}>
                  {isSubmitting ? "Salvando..." : "Salva valutazione"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {canCancel && (
        <Button variant="outline" size="sm" onClick={handleCancel} disabled={isCancelling}>
          <X className="h-4 w-4 mr-2" />
          {isCancelling ? "Annullando..." : "Annulla"}
        </Button>
      )}
    </div>
  )
}
