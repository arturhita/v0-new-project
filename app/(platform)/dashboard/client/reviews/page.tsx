"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, Trash2 } from "lucide-react" // Rimosso Edit2
import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "@/components/ui/use-toast"

interface Review {
  id: string
  expertName: string
  date: string
  rating: number
  comment: string
}

const initialReviews: Review[] = [
  {
    id: "r1",
    expertName: "Dott.ssa Elena Bianchi",
    date: "16 Giugno 2025",
    rating: 5,
    comment: "Consulenza eccellente, molto professionale e d'aiuto.",
  },
  {
    id: "r2",
    expertName: "Avv. Marco Rossetti",
    date: "11 Giugno 2025",
    rating: 4,
    comment: "Bravo e competente, ha risolto il mio dubbio legale.",
  },
]

export default function MyReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>(initialReviews)
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null)

  const handleDeleteReview = (reviewId: string) => {
    setReviews((prevReviews) => prevReviews.filter((review) => review.id !== reviewId))
    toast({
      title: "Recensione Eliminata",
      description: "La tua recensione è stata rimossa con successo.",
    })
    setReviewToDelete(null) // Chiudi la modale di conferma
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-slate-800">Le Mie Recensioni</h1>
      <CardDescription className="text-slate-500 -mt-4">
        Gestisci le recensioni che hai lasciato per i consulenti.
      </CardDescription>

      {reviews.length === 0 ? (
        <Card className="shadow-lg rounded-xl">
          <CardContent className="pt-6 text-center text-slate-500">Non hai ancora lasciato recensioni.</CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id} className="shadow-md hover:shadow-lg transition-shadow rounded-xl">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg text-slate-700">Recensione per {review.expertName}</CardTitle>
                    <CardDescription className="text-xs text-slate-400">{review.date}</CardDescription>
                  </div>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${i < review.rating ? "text-amber-400 fill-amber-400" : "text-slate-300"}`}
                      />
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 mb-3">{review.comment}</p>
                <div className="flex gap-2">
                  {/* Bottone Modifica Rimosso */}
                  <AlertDialog
                    open={reviewToDelete === review.id}
                    onOpenChange={(isOpen) => !isOpen && setReviewToDelete(null)}
                  >
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="destructive" onClick={() => setReviewToDelete(review.id)}>
                        <Trash2 className="h-4 w-4 mr-1.5" /> Elimina
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Conferma Eliminazione</AlertDialogTitle>
                        <AlertDialogDescription>
                          Sei sicuro di voler eliminare questa recensione? L'azione è irreversibile.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setReviewToDelete(null)}>Annulla</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteReview(review.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Elimina Definitivamente
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
