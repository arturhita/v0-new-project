import { getOperatorPublicProfile } from "@/lib/actions/operator.actions"
import { notFound } from "next/navigation"
import Image from "next/image"
import { Star, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import OperatorAvailabilityCalendar from "@/components/operator-availability-calendar"
import { ReviewCard, type Review } from "@/components/review-card"
import { OperatorProfileClientSection } from "@/components/operator-profile-client-section"
import { ConstellationBackground } from "@/components/constellation-background"

type OperatorProfilePageProps = {
  params: {
    operatorName: string
  }
}

export default async function OperatorProfilePage({ params }: OperatorProfilePageProps) {
  const operatorName = decodeURIComponent(params.operatorName)
  const profileData = await getOperatorPublicProfile(operatorName)

  if (!profileData) {
    notFound()
  }

  const {
    id,
    stage_name,
    avatar_url,
    specialization,
    bio,
    rating,
    reviews_count,
    services,
    availability,
    reviews,
    is_online,
    tags,
  } = profileData

  return (
    <div className="relative text-white min-h-screen">
      <ConstellationBackground />
      <div className="relative z-10 container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
          {/* Colonna Sinistra - Profilo e Azioni */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-gradient-to-br from-blue-900/80 via-blue-800/70 to-blue-700/80 backdrop-blur-lg rounded-3xl shadow-lg border border-yellow-600/30 p-6 flex flex-col items-center text-center">
              <div className="relative w-40 h-40 mb-4">
                <Image
                  src={avatar_url || "/placeholder.svg?width=160&height=160"}
                  alt={`Foto di ${stage_name}`}
                  width={160}
                  height={160}
                  className="rounded-full object-cover border-4 border-yellow-500 shadow-lg"
                />
                {is_online && (
                  <span className="absolute bottom-2 right-2 block h-5 w-5 rounded-full bg-green-500 border-2 border-gray-900 ring-2 ring-green-500 animate-pulse" />
                )}
              </div>
              <h1 className="text-3xl font-bold">{stage_name}</h1>
              <p className="text-lg text-amber-400 mb-4">{(specialization || []).join(", ")}</p>

              <div className="flex items-center space-x-2 mb-6">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-5 h-5 ${i < (rating || 0) ? "fill-current" : "text-gray-400"}`} />
                  ))}
                </div>
                <span className="text-slate-300">
                  {rating?.toFixed(1)} ({reviews_count} recensioni)
                </span>
              </div>

              <OperatorProfileClientSection
                operator={{
                  id,
                  stageName: stage_name || "",
                  services: services || [],
                }}
              />
            </div>

            <div className="bg-gradient-to-br from-blue-900/80 via-blue-800/70 to-blue-700/80 backdrop-blur-lg rounded-3xl shadow-lg border border-yellow-600/30 p-6">
              <h3 className="text-xl font-semibold mb-3 text-amber-400">Servizi Offerti</h3>
              <ul className="space-y-2 text-slate-300">
                {services?.map((service: any) => (
                  <li key={service.service_type} className="flex justify-between">
                    <span>
                      {
                        { chat: "Chat al minuto", call: "Chiamata al minuto", written: "Consulto Scritto" }[
                          service.service_type
                        ]
                      }
                    </span>
                    <span className="font-semibold text-white">€{service.price?.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Colonna Destra - Dettagli e Recensioni */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-gradient-to-br from-blue-900/80 via-blue-800/70 to-blue-700/80 backdrop-blur-lg rounded-3xl shadow-lg border border-yellow-600/30 p-6">
              <h2 className="text-2xl font-bold mb-4">Chi sono</h2>
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{bio}</p>
              <div className="flex flex-wrap gap-2 mt-4">
                {tags?.map((tag: string) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="bg-blue-700/50 text-white border border-yellow-600/30 hover:bg-blue-600/50 transition-colors duration-300"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-900/80 via-blue-800/70 to-blue-700/80 backdrop-blur-lg rounded-3xl shadow-lg border border-yellow-600/30 p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <Calendar className="mr-3 text-amber-400" /> La mia disponibilità
              </h2>
              <OperatorAvailabilityCalendar availability={availability} />
            </div>

            <div className="bg-gradient-to-br from-blue-900/80 via-blue-800/70 to-blue-700/80 backdrop-blur-lg rounded-3xl shadow-lg border border-yellow-600/30 p-6">
              <h2 className="text-2xl font-bold mb-4">Ultime Recensioni</h2>
              <div className="space-y-6">
                {reviews && reviews.length > 0 ? (
                  reviews.map((review: any) => <ReviewCard key={review.id} review={review as Review} />)
                ) : (
                  <p className="text-slate-400">Nessuna recensione ancora.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
