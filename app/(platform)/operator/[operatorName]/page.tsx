import { getOperatorPublicProfile } from "@/lib/actions/operator.actions"
import { notFound } from "next/navigation"
import Image from "next/image"
import { Star, Calendar, MessageCircle, Award } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
    <div className="relative text-white min-h-screen bg-[#0B1120] font-sans overflow-x-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-[#1e3c96]/30 to-[#0B1120]"></div>
      <ConstellationBackground className="text-yellow-400/50" />
      <div className="relative z-10 container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Colonna Sinistra */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-gradient-to-br from-[#1e3c96]/70 via-[#10245c]/80 to-black/50 backdrop-blur-lg border border-white/10 rounded-2xl p-6 flex flex-col items-center text-center shadow-2xl shadow-[#1e3c96]/10">
              <div className="relative w-36 h-36 mb-4">
                <div className="w-full h-full rounded-full overflow-hidden border-4 border-blue-400/50 bg-white/10">
                  <Image
                    src={avatar_url || "/placeholder.svg?width=144&height=144"}
                    alt={`Foto di ${stage_name}`}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-full"
                  />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-white">{stage_name}</h1>
              <p className="text-md text-blue-300 mb-4">{(specialization || []).join(", ")}</p>

              <div className="flex items-center space-x-2 mb-4">
                <Star className="w-5 h-5 text-sky-400 fill-sky-400" />
                <span className="text-white font-bold text-lg">{rating?.toFixed(1)}</span>
                <span className="text-blue-300">({reviews_count} rec.)</span>
              </div>

              <Badge
                variant="outline"
                className={`py-1 px-4 rounded-md text-sm transition-all duration-300 ${
                  is_online
                    ? "bg-green-500/20 border-green-400/50 text-green-300"
                    : "bg-slate-600/50 border-slate-500/50 text-slate-300"
                }`}
              >
                {is_online ? "Online" : "Offline"}
              </Badge>

              <div className="w-full mt-6 pt-6 border-t border-white/10">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center justify-center">
                  <Award className="mr-2 text-blue-300" /> Badge Ottenuti
                </h3>
                <div className="flex justify-center space-x-3">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="w-12 h-12 rounded-full bg-black/20 border-2 border-white/20 flex items-center justify-center hover:border-blue-300 hover:bg-black/40 transition-all duration-300 cursor-pointer"
                    >
                      <Star className="w-6 h-6 text-blue-400" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-[#1e3c96]/70 via-[#10245c]/80 to-black/50 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-2xl shadow-[#1e3c96]/10">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <Calendar className="mr-3 text-blue-300" /> Disponibilità Indicativa
              </h2>
              <OperatorAvailabilityCalendar availability={availability} />
            </div>
          </div>

          {/* Colonna Destra */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-gradient-to-br from-[#1e3c96]/70 via-[#10245c]/80 to-black/50 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-2xl shadow-[#1e3c96]/10">
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <MessageCircle className="mr-3 text-blue-300" /> Un Breve Saluto
              </h2>
              <p className="text-blue-200 leading-relaxed mb-6">
                {bio?.substring(0, 250) || "Nessuna biografia breve disponibile."}
                {bio && bio.length > 250 ? "..." : ""}
              </p>
              <OperatorProfileClientSection
                operator={{
                  id,
                  stageName: stage_name || "",
                  services: services || [],
                  isOnline: is_online || false,
                }}
              />
            </div>

            <div className="bg-gradient-to-br from-[#1e3c96]/70 via-[#10245c]/80 to-black/50 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-2xl shadow-[#1e3c96]/10">
              <Tabs defaultValue="specializzazioni" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-black/20 rounded-lg p-1 border border-white/10">
                  <TabsTrigger value="biografia">Biografia</TabsTrigger>
                  <TabsTrigger value="esperienza">Esperienza</TabsTrigger>
                  <TabsTrigger value="specializzazioni">Specializzazioni</TabsTrigger>
                </TabsList>
                <div className="mt-6 text-blue-200 leading-relaxed whitespace-pre-wrap min-h-[200px]">
                  <TabsContent value="biografia">
                    <h3 className="text-xl font-bold text-white mb-4">La mia storia</h3>
                    {bio || "Nessuna biografia disponibile."}
                  </TabsContent>
                  <TabsContent value="esperienza">
                    <h3 className="text-xl font-bold text-white mb-4">La mia esperienza</h3>
                    {"Nessuna esperienza specificata."}
                  </TabsContent>
                  <TabsContent value="specializzazioni">
                    <h3 className="text-xl font-bold text-white mb-4">Le mie specializzazioni</h3>
                    <div className="flex flex-wrap gap-3">
                      {tags?.map((tag: string) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="bg-blue-800/70 text-blue-200 border border-blue-500/30 text-sm hover:bg-blue-800/90 hover:border-blue-400 transition-all duration-300"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </TabsContent>
                </div>
                <h3 className="text-xl font-bold text-white mb-4 mt-8">Ultime Recensioni</h3>
                <div className="space-y-6">
                  {reviews && reviews.length > 0 ? (
                    reviews.map((review: any) => <ReviewCard key={review.id} review={review as Review} />)
                  ) : (
                    <p className="text-blue-200">Nessuna recensione ancora.</p>
                  )}
                </div>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
