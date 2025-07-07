"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Star, CheckCircle, XCircle, MessageCircle } from "lucide-react"

interface Review {
  id: string
  userName: string
  operatorName: string
  rating: number
  comment: string
  date: string
  status: "Pending" | "Approved" | "Rejected" // Le recensioni "Approved" sono visibili, "Pending" sono quelle "dannose"
}

const initialReviews: Review[] = [
  {
    id: "rev1",
    userName: "Marco Rossi",
    operatorName: "Stella Divina",
    rating: 2,
    comment: "Non mi sono trovato bene, l'operatore sembrava distratto e poco empatico. Sconsigliato.",
    date: "2025-06-20",
    status: "Pending",
  },
  {
    id: "rev2",
    userName: "Giulia Verdi",
    operatorName: "Oracolo Celeste",
    rating: 5,
    comment: "Consulto illuminante! Oracolo Celeste è stato incredibilmente preciso e gentile. Grazie!",
    date: "2025-06-19",
    status: "Approved", // Questa è già approvata e visibile (simulazione)
  },
  {
    id: "rev3",
    userName: "Luca Neri",
    operatorName: "Stella Divina",
    rating: 1,
    comment: "Pessima esperienza, non ha capito nulla della mia situazione. Soldi buttati.",
    date: "2025-06-21",
    status: "Pending",
  },
]

export default function ModerateReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>(initialReviews)

  const handleReviewAction = (reviewId: string, newStatus: "Approved" | "Rejected") => {
    setReviews((prev) => prev.map((rev) => (rev.id === reviewId ? { ...rev, status: newStatus } : rev)))
    alert(`Recensione ${reviewId} ${newStatus === "Approved" ? "approvata e pubblicata" : "rifiutata"} (simulazione).`)
  }

  const pendingReviews = reviews.filter((r) => r.status === "Pending")

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-slate-800">Moderazione Recensioni</h1>
      <CardDescription className="text-slate-500 -mt-4">
        Le recensioni positive (4-5 stelle) vengono pubblicate automaticamente. Qui visualizzi quelle potenzialmente
        problematiche (1-3 stelle) o segnalate, in attesa di approvazione.
      </CardDescription>

      {pendingReviews.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-slate-500">
            Nessuna recensione in attesa di moderazione.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {pendingReviews.map((rev) => (
            <Card key={rev.id} className="shadow-lg rounded-xl">
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                  <CardTitle className="text-lg text-slate-700 flex items-center">
                    <MessageCircle className="h-5 w-5 mr-2 text-[hsl(var(--primary-medium))]" />
                    Recensione per {rev.operatorName}
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
                  Da: {rev.userName} - Data: {new Date(rev.date).toLocaleDateString("it-IT")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 mb-4 bg-slate-50 p-3 rounded-md">{rev.comment}</p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={() => handleReviewAction(rev.id, "Approved")}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" /> Approva e Pubblica
                  </Button>
                  <Button
                    onClick={() => handleReviewAction(rev.id, "Rejected")}
                    variant="destructive"
                    className="bg-red-500 hover:bg-red-600 text-white"
                  >
                    <XCircle className="mr-2 h-4 w-4" /> Rifiuta Recensione
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <Card className="mt-8 shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="text-lg text-slate-700">Storico Recensioni Moderate</CardTitle>
          <CardDescription className="text-sm text-slate-500">
            Elenco delle recensioni già approvate o rifiutate. (UI Placeholder)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-400">
            Qui verrebbe visualizzata una tabella con le recensioni già moderate.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
