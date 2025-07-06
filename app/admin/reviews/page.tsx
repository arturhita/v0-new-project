"use client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { getPendingReviews } from "@/lib/actions/reviews.actions"
import { ReviewModerationClient } from "./review-moderation-client"

interface Review {
  id: string
  userName: string
  operatorName: string
  rating: number
  comment: string
  date: string
  status: "Pending" | "Approved" | "Rejected" // Le recensioni "Approved" sono visibili, "Pending" sono quelle "dannose"
}

export default async function ModerateReviewsPage() {
  const pendingReviews = await getPendingReviews()

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-slate-800">Moderazione Recensioni</h1>
      <CardDescription className="text-slate-500 -mt-4">
        Le recensioni con 4-5 stelle vengono pubblicate automaticamente. Qui visualizzi quelle con 1-3 stelle in attesa
        di approvazione.
      </CardDescription>

      <ReviewModerationClient initialReviews={pendingReviews} />

      <Card className="mt-8 shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="text-lg text-slate-700">Storico Recensioni Moderate</CardTitle>
          <CardDescription className="text-sm text-slate-500">
            Elenco delle recensioni già approvate o rifiutate. (Funzionalità da implementare)
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
