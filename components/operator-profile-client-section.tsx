"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OperatorBadges } from "@/components/operator-badges"
import ReviewCard, { type Review } from "@/components/review-card"
import { OperatorAvailabilityCalendar } from "@/components/operator-availability-calendar"
import type { Availability } from "@/lib/actions/operator.actions"

interface OperatorProfileClientSectionProps {
  bio: string
  reviews: Review[]
  availability: Availability | null
}

const OperatorProfileClientSection = ({ bio, reviews, availability }: OperatorProfileClientSectionProps) => {
  return (
    <div className="mt-8">
      <Tabs defaultValue="about" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="about">Chi Sono</TabsTrigger>
          <TabsTrigger value="reviews">Recensioni ({reviews.length})</TabsTrigger>
          <TabsTrigger value="availability">Disponibilità</TabsTrigger>
        </TabsList>
        <TabsContent
          value="about"
          className="mt-6 text-blue-200 bg-slate-900/50 p-6 rounded-lg border border-slate-800"
        >
          <h3 className="font-bold text-lg text-white mb-4">La mia storia</h3>
          <p className="whitespace-pre-wrap">{bio}</p>
          <div className="mt-6">
            <h3 className="font-bold text-lg text-white mb-4">I miei riconoscimenti</h3>
            <OperatorBadges />
          </div>
        </TabsContent>
        <TabsContent
          value="reviews"
          className="mt-6 text-blue-200 bg-slate-900/50 p-6 rounded-lg border border-slate-800"
        >
          <div className="space-y-6">
            {reviews.length > 0 ? (
              reviews.map((review) => <ReviewCard key={review.id} review={review} />)
            ) : (
              <p>Ancora nessuna recensione per questo operatore.</p>
            )}
          </div>
        </TabsContent>
        <TabsContent
          value="availability"
          className="mt-6 text-blue-200 bg-slate-900/50 p-6 rounded-lg border border-slate-800"
        >
          <h3 className="font-bold text-lg text-white mb-4">I miei orari</h3>
          <OperatorAvailabilityCalendar availability={availability} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default OperatorProfileClientSection
