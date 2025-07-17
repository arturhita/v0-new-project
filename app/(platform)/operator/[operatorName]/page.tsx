import { getOperatorPublicProfile } from "@/lib/actions/operator.actions"
import { notFound } from "next/navigation"
import Image from "next/image"
import { Star, Phone, MessageSquare, Video, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import OperatorAvailabilityCalendar from "@/components/operator-availability-calendar"
import ReviewCard from "@/components/review-card"
import { WrittenConsultationModal } from "@/components/written-consultation-modal"

export default async function OperatorProfilePage({ params }: { params: { operatorName: string } }) {
  const operator = await getOperatorPublicProfile(params.operatorName)

  if (!operator) {
    notFound()
  }

  const averageRating = operator.average_rating ? Number(operator.average_rating).toFixed(1) : "N/A"

  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonna Sinistra: Profilo e Azioni */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="overflow-hidden">
              <CardContent className="p-6 text-center">
                <Image
                  src={operator.avatar_url || "/placeholder.svg?width=128&height=128&query=avatar"}
                  alt={`Foto di ${operator.full_name}`}
                  width={128}
                  height={128}
                  className="rounded-full mx-auto mb-4 border-4 border-white shadow-lg"
                />
                <h1 className="text-2xl font-bold">{operator.full_name}</h1>
                <p className="text-sm text-muted-foreground">@{operator.username}</p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Star className="w-5 h-5 text-yellow-400" />
                  <span className="font-bold text-lg">{averageRating}</span>
                  <span className="text-muted-foreground">({operator.review_count} recensioni)</span>
                </div>
              </CardContent>
              <div className="bg-gray-50 dark:bg-gray-800/50 p-4 border-t">
                <div className="flex justify-around">
                  <Button variant="ghost" size="sm" className="flex flex-col h-auto gap-1">
                    <Phone className="w-5 h-5" />
                    <span className="text-xs">Chiama</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="flex flex-col h-auto gap-1">
                    <MessageSquare className="w-5 h-5" />
                    <span className="text-xs">Chat</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="flex flex-col h-auto gap-1">
                    <Video className="w-5 h-5" />
                    <span className="text-xs">Video</span>
                  </Button>
                </div>
              </div>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Specializzazioni</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {operator.specializations?.map((spec: string) => (
                    <Badge key={spec} variant="secondary">
                      {spec}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Biografia</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">{operator.bio}</p>
              </CardContent>
            </Card>
          </div>

          {/* Colonna Destra: Servizi, Disponibilità, Recensioni */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Servizi Offerti</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {operator.services?.map((service: any) => (
                  <div key={service.id} className="p-4 border rounded-lg flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">{service.name}</h3>
                      <p className="text-sm text-muted-foreground">{service.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-primary">€{service.price_per_minute.toFixed(2)}/min</p>
                      <Badge variant="outline">{service.type}</Badge>
                    </div>
                  </div>
                ))}
                <WrittenConsultationModal operatorId={operator.id} operatorName={operator.full_name} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Disponibilità
                </CardTitle>
              </CardHeader>
              <CardContent>
                <OperatorAvailabilityCalendar availability={operator.availability} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recensioni Recenti</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {operator.reviews?.length > 0 ? (
                  operator.reviews.map((review: any) => <ReviewCard key={review.id} review={review} />)
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    Questo operatore non ha ancora ricevuto recensioni.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
