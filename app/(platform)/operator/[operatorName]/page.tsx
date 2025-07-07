import { getOperatorByStageName } from "@/lib/actions/operator.actions"
import { notFound } from "next/navigation"
import Image from "next/image"
import { Star, ShieldCheck, MessageCircle, Phone, Video } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn, formatCurrency } from "@/lib/utils"
import ReviewCard from "@/components/review-card"
import type { Review } from "@/types/database"

export default async function OperatorProfilePage({ params }: { params: { operatorName: string } }) {
  const operator = await getOperatorByStageName(params.operatorName)

  if (!operator) {
    notFound()
  }

  const {
    stage_name,
    headline,
    bio,
    is_available,
    is_online,
    profile_image_url,
    average_rating,
    review_count,
    main_discipline,
    specialties,
    chat_price_per_minute,
    call_price_per_minute,
    video_price_per_minute,
    reviews,
  } = operator

  return (
    <div className="bg-slate-50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Operator Details */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="relative w-32 h-32 sm:w-48 sm:h-48 rounded-full overflow-hidden border-4 border-white shadow-lg flex-shrink-0 mx-auto sm:mx-0">
                    <Image
                      src={profile_image_url || "/placeholder.svg?width=200&height=200&query=mystical+portrait"}
                      alt={`Ritratto di ${stage_name}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <h1 className="text-3xl font-bold text-gray-800">{stage_name}</h1>
                      <div
                        className={cn(
                          "flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-semibold",
                          is_online ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800",
                        )}
                      >
                        <span className={cn("h-2 w-2 rounded-full", is_online ? "bg-green-500" : "bg-gray-400")} />
                        {is_online ? "Online" : "Offline"}
                      </div>
                    </div>
                    <p className="text-indigo-600 font-semibold mt-1">{headline}</p>
                    <div className="flex items-center justify-center sm:justify-start gap-4 mt-3 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        <span className="font-bold">{average_rating?.toFixed(1) || "N/A"}</span>
                        <span>({review_count || 0} recensioni)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ShieldCheck className="h-4 w-4 text-green-500" />
                        <span>Esperto Verificato</span>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap justify-center sm:justify-start gap-2">
                      <Badge variant="default">{main_discipline}</Badge>
                      {specialties?.map((spec) => (
                        <Badge key={spec} variant="secondary">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Chi sono</CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none text-gray-700">
                <p>{bio}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recensioni ({review_count || 0})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {reviews && reviews.length > 0 ? (
                  (reviews as unknown as Review[]).map((review) => <ReviewCard key={review.id} review={review} />)
                ) : (
                  <p className="text-center text-gray-500">Questo operatore non ha ancora ricevuto recensioni.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Actions */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Inizia un consulto</CardTitle>
                <p className="text-sm text-gray-500">
                  {is_available ? "L'esperto è disponibile ora!" : "L'esperto non è disponibile al momento."}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button size="lg" className="w-full" disabled={!is_available}>
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Chat ({formatCurrency(chat_price_per_minute)}/min)
                </Button>
                <Button size="lg" className="w-full bg-transparent" variant="outline" disabled={!is_available}>
                  <Phone className="mr-2 h-5 w-5" />
                  Chiamata ({formatCurrency(call_price_per_minute)}/min)
                </Button>
                <Button size="lg" className="w-full bg-transparent" variant="outline" disabled={!is_available}>
                  <Video className="mr-2 h-5 w-5" />
                  Video ({formatCurrency(video_price_per_minute)}/min)
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
