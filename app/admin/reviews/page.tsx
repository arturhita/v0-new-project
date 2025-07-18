import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getPendingReviews } from "@/lib/actions/reviews.actions"
import { ReviewModerationCard } from "./review-moderation-card"

export default async function ReviewsPage() {
  const { data: reviews, error } = await getPendingReviews()

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Moderazione Recensioni</CardTitle>
          <CardDescription>Approva o rifiuta le recensioni lasciate dagli utenti.</CardDescription>
        </CardHeader>
        <CardContent>
          {reviews && reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <ReviewModerationCard key={review.id} review={review} />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">Nessuna recensione in attesa di moderazione.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
