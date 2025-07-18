import { getReviewsForModeration } from "@/lib/actions/reviews.actions"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ReviewModerationCard } from "./review-moderation-card"

export default async function AdminReviewsPage() {
  const reviews = await getReviewsForModeration()

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Moderazione Recensioni</CardTitle>
          <CardDescription>
            Approva o rifiuta le recensioni lasciate dagli utenti. Le recensioni approvate saranno visibili
            pubblicamente.
          </CardDescription>
        </CardHeader>
      </Card>

      {reviews.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <ReviewModerationCard key={review.id} review={review} />
          ))}
        </div>
      ) : (
        <Card className="flex items-center justify-center h-48">
          <p className="text-muted-foreground">Nessuna recensione da moderare.</p>
        </Card>
      )}
    </div>
  )
}
