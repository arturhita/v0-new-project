import Image from "next/image"
import { notFound } from "next/navigation"
import { getOperatorByStageName, getReviewsForOperator } from "@/lib/actions/data.actions"
import { Star, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ReviewCard } from "@/components/review-card"
import StartChatButton from "@/components/start-chat-button"

export default async function OperatorProfilePage({ params }: { params: { operatorName: string } }) {
  const operatorName = decodeURIComponent(params.operatorName)
  const operator = await getOperatorByStageName(operatorName)

  if (!operator) {
    notFound()
  }

  const reviews = await getReviewsForOperator(operator.id)

  const averageRating =
    reviews.length > 0 ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length : 0

  return (
    <div className="bg-gradient-to-br from-[#000020] via-[#1E3C98] to-[#000020] text-white min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Colonna Sinistra - Profilo */}
          <div className="md:col-span-1">
            <Card className="bg-white/10 border-blue-500/20 backdrop-blur-lg">
              <CardContent className="p-6 text-center">
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <Image
                    src={operator.avatar_url || "/images/placeholder.svg?width=128&height=128"}
                    alt={`Foto di ${operator.stage_name}`}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-full border-4 border-blue-400"
                  />
                  <span
                    className={`absolute bottom-1 right-1 block h-5 w-5 rounded-full ${
                      operator.availability === "online" ? "bg-green-500" : "bg-gray-500"
                    } border-2 border-white/10`}
                  />
                </div>
                <h1 className="text-3xl font-bold">{operator.stage_name}</h1>
                <p className="text-blue-300">{operator.specialization || "Esperto di Cartomanzia"}</p>
                <div className="flex items-center justify-center mt-2">
                  <Star className="w-5 h-5 text-yellow-400" fill="currentColor" />
                  <span className="ml-1 font-bold text-lg">{averageRating.toFixed(1)}</span>
                  <span className="ml-2 text-slate-300">({reviews.length} recensioni)</span>
                </div>
                <div className="mt-4 flex justify-center gap-2">
                  <StartChatButton operatorId={operator.id} />
                  <Button
                    variant="outline"
                    className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white bg-transparent"
                  >
                    <Phone className="w-4 h-4 mr-2" /> Chiama
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Colonna Destra - Dettagli */}
          <div className="md:col-span-2">
            <Card className="bg-white/10 border-blue-500/20 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="text-2xl">Chi sono</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-200 whitespace-pre-wrap">{operator.bio || "Nessuna biografia disponibile."}</p>
                <div className="mt-6">
                  <h3 className="text-xl font-semibold mb-3">Specializzazioni</h3>
                  <div className="flex flex-wrap gap-2">
                    {((operator.services as string[]) || ["Tarocchi", "Astrologia", "Amore"]).map((service) => (
                      <Badge
                        key={service}
                        variant="secondary"
                        className="bg-blue-500/20 text-blue-200 border-blue-500/30"
                      >
                        {service}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sezione Recensioni */}
            <Card className="bg-white/10 border-blue-500/20 backdrop-blur-lg mt-8">
              <CardHeader>
                <CardTitle className="text-2xl">Recensioni dei Clienti</CardTitle>
              </CardHeader>
              <CardContent>
                {reviews.length > 0 ? (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <ReviewCard key={review.id} review={review} />
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-300 text-center py-4">Questo operatore non ha ancora ricevuto recensioni.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
