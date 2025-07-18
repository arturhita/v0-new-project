import { getOperatorPublicProfile } from "@/lib/actions/operator.actions"
import { notFound } from "next/navigation"
import Image from "next/image"
import { Star, Calendar, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import OperatorAvailabilityCalendar from "@/components/operator-availability-calendar"
import { ReviewCard, type Review } from "@/components/review-card"
import { OperatorProfileClientSection } from "@/components/operator-profile-client-section"
import { ConstellationBackground } from "@/components/constellation-background"
import { cn } from "@/lib/utils"

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
    <div className="relative text-white min-h-screen overflow-hidden">
      <ConstellationBackground />
      <div className="relative z-10 container mx-auto px-4 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
          {/* Colonna Sinistra - Profilo e Azioni */}
          <div className="lg:col-span-4 flex flex-col items-center text-center lg:items-start lg:text-left">
            <div className="relative w-48 h-48 mb-6">
              <Image
                src={avatar_url || "/placeholder.svg?width=192&height=192"}
                alt={`Foto di ${stage_name}`}
                width={192}
                height={192}
                className="rounded-full object-cover border-4 border-yellow-500/80 shadow-lg shadow-yellow-500/20"
              />
              {is_online && (
                <div className="absolute bottom-3 right-3">
                  <span className="relative flex h-5 w-5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-5 w-5 bg-green-500 border-2 border-slate-900"></span>
                  </span>
                </div>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-amber-500 mb-2">
              {stage_name}
            </h1>
            <p className="text-lg text-indigo-300 mb-4">{(specialization || []).join(", ")}</p>

            <div className="flex items-center space-x-2 mb-6">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={cn("w-5 h-5", i < (rating || 0) ? "fill-current" : "text-slate-600")} />
                ))}
              </div>
              <span className="text-slate-300">
                {rating?.toFixed(1)} ({reviews_count} recensioni)
              </span>
            </div>

            <div className="w-full max-w-xs mx-auto lg:mx-0">
              <OperatorProfileClientSection
                operator={{
                  id,
                  stageName: stage_name || "",
                  services: services || [],
                  isOnline: is_online || false,
                }}
              />
            </div>
          </div>

          {/* Colonna Destra - Dettagli e Recensioni */}
          <div className="lg:col-span-8 space-y-10">
            <section>
              <h2 className="text-2xl font-bold mb-4 border-b-2 border-yellow-500/30 pb-2 flex items-center gap-3">
                <Sparkles className="text-amber-400" />
                <span>Chi sono</span>
              </h2>
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{bio}</p>
              <div className="flex flex-wrap gap-2 mt-6">
                {tags?.map((tag: string) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="bg-indigo-900/50 text-slate-200 border border-indigo-400/30"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 border-b-2 border-yellow-500/30 pb-2 flex items-center gap-3">
                <Calendar className="text-amber-400" />
                <span>La mia disponibilità</span>
              </h2>
              <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
                <OperatorAvailabilityCalendar availability={availability} />
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 border-b-2 border-yellow-500/30 pb-2">Ultime Recensioni</h2>
              <div className="space-y-6">
                {reviews && reviews.length > 0 ? (
                  reviews.map((review: any) => <ReviewCard key={review.id} review={review as Review} />)
                ) : (
                  <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-6 text-center text-slate-400">
                    <p>Questo esperto non ha ancora ricevuto recensioni.</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
