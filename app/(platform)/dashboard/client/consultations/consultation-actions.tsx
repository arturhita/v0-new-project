"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { useState } from "react"
import { updateConsultationRating, cancelConsultation, type Consultation } from "@/lib/actions/consultations.actions"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Star } from "lucide-react"

interface ConsultationActionsProps {
  consultation: Consultation
}

export function ConsultationActions({ consultation }: ConsultationActionsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showReviewDialog, setShowReviewDialog] = useState(false)
  const [rating, setRating] = useState(0)
  const [reviewText, setReviewText] = useState("")
  const router = useRouter()

  const handleCancelConsultation = async () => {
    setIsLoading(true)
    try {
      const result = await cancelConsultation(consultation.id)
      if (result.success) {
        toast.success("Consulenza cancellata con successo")
        router.refresh()
      } else {
        toast.error("Errore durante la cancellazione")
      }
    } catch (error) {
      toast.error("Errore durante la cancellazione")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitReview = async () => {
    if (rating === 0) {
      toast.error("Seleziona una valutazione")
      return
    }

    setIsLoading(true)
    try {
      const result = await updateConsultationRating(consultation.id, rating, reviewText)
      if (result.success) {
        toast.success("Recensione inviata con successo")
        setShowReviewDialog(false)
        router.refresh()
      } else {
        toast.error("Errore durante l'invio della recensione")
      }
    } catch (error) {
      toast.error("Errore durante l'invio della recensione")
    } finally {
      setIsLoading(false)
    }
  }

  const downloadReceipt = () => {
    // Implementazione per scaricare la ricevuta
    toast.info("Funzionalità in sviluppo")
  }

  return (
    <div className="pt-2 flex gap-2">
      {consultation.status === "completed" && !consultation.rating && (
        <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-gradient-to-r from-amber-400 to-orange-500 text-white">
              Lascia una Recensione
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Lascia una recensione</DialogTitle>
              <DialogDescription>Valuta la tua esperienza con {consultation.operatorName}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Valutazione</label>
                <div className="flex items-center space-x-1 mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type="button" onClick={() => setRating(star)} className="focus:outline-none">
                      <Star
                        className={`h-6 w-6 ${star <= rating ? "text-amber-400 fill-amber-400" : "text-slate-300"}`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Commento (opzionale)</label>
                <Textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Descrivi la tua esperienza..."
                  className="mt-1"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowReviewDialog(false)}>
                Annulla
              </Button>
              <Button onClick={handleSubmitReview} disabled={isLoading}>
                {isLoading ? "Invio..." : "Invia Recensione"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {consultation.status === "completed" && (
        <Button size="sm" variant="outline" onClick={downloadReceipt}>
          <Download className="h-4 w-4 mr-1.5" /> Ricevuta
        </Button>
      )}

      {consultation.status === "scheduled" && (
        <Button size="sm" variant="destructive" onClick={handleCancelConsultation} disabled={isLoading}>
          {isLoading ? "Cancellazione..." : "Annulla"}
        </Button>
      )}
    </div>
  )
}
