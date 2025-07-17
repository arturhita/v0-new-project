import { getOperatorPublicProfile } from "@/lib/actions/operator.actions"
import { notFound } from "next/navigation"
import Image from "next/image"
import { Star, Phone, MessageSquare, Calendar } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import OperatorAvailabilityCalendar from "@/components/operator-availability-calendar"
import { ReviewCard, type Review } from "@/components/review-card"
import { WrittenConsultationModal } from "@/components/written-consultation-modal"
import Link from "next/link"

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
    full_name,
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

  const hasChat = services?.some((s) => s.service_type === "chat")
  const hasCall = services?.some((s) => s.service_type === "call")
  const hasWritten = services?.some((s) => s.service_type === "written")

  return (
    <div className="bg-slate-900 text-white">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
          {/* Colonna Sinistra - Profilo e Azioni */}
          <div className="lg:col-span-1 flex flex-col items-center lg:items-start">
            <div className="relative w-48 h-48 mb-4">
              <Image
                src={avatar_url || "/placeholder.svg?width=192&height=192"}
                alt={`Foto di ${full_name}`}
                width={192}
                height={192}
                className="rounded-full object-cover border-4 border-blue-500 shadow-lg"
              />
              {is_online && (
                <span className="absolute bottom-2 right-2 block h-6 w-6 rounded-full bg-green-500 border-2 border-slate-800 ring-2 ring-green-500 animate-pulse" />
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-center lg:text-left">{full_name}</h1>
            <p className="text-lg text-amber-400 mb-4 text-center lg:text-left">{specialization}</p>

            <div className="flex items-center space-x-2 mb-6">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-5 h-5 ${i < (rating || 0) ? "fill-current" : "text-gray-600"}`} />
                ))}
              </div>
              <span className="text-slate-300">
                {rating?.toFixed(1)} ({reviews_count} recensioni)
              </span>
            </div>

            <div className="w-full space-y-3">
              {hasChat && (
                <Button asChild size="lg" className="w-full bg-green-600 hover:bg-green-700">
                  <Link href={`/chat/new?operatorId=${id}`}>
                    <MessageSquare className="mr-2 h-5 w-5" /> Inizia Chat
                  </Link>
                </Button>
              )}
              {hasCall && (
                <Button asChild size="lg" className="w-full bg-blue-600 hover:bg-blue-700">
                  <Link href={`/call/new?operatorId=${id}`}>
                    <Phone className="mr-2 h-5 w-5" /> Chiama Ora
                  </Link>
                </Button>
              )}
              {hasWritten && <WrittenConsultationModal operatorId={id} operatorName={full_name} />}
            </div>

            <div className="mt-8 w-full bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <h3 className="text-xl font-semibold mb-3 text-amber-400">Servizi Offerti</h3>
              <ul className="space-y-2 text-slate-300">
                {services?.map((service) => (
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
          <div className="lg:col-span-2">
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700 mb-8">
              <h2 className="text-2xl font-bold mb-4">Chi sono</h2>
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{bio}</p>
              <div className="flex flex-wrap gap-2 mt-4">
                {tags?.map((tag) => (
                  <Badge key={tag} variant="secondary" className="bg-slate-700 text-slate-200">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700 mb-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <Calendar className="mr-3 text-amber-400" /> La mia disponibilità
              </h2>
              <OperatorAvailabilityCalendar availability={availability} />
            </div>

            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h2 className="text-2xl font-bold mb-4">Ultime Recensioni</h2>
              <div className="space-y-6">
                {reviews && reviews.length > 0 ? (
                  reviews.map((review) => <ReviewCard key={review.id} review={review as Review} />)
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
