import { notFound } from "next/navigation"
import Image from "next/image"
import { Star } from "lucide-react"
import { getOperatorByName } from "@/lib/actions/operator.actions"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import OperatorAvailabilityCalendar from "@/components/operator-availability-calendar"
import ReviewCard from "@/components/review-card"
import ConstellationBackground from "@/components/constellation-background"
import OperatorProfileClientSection from "@/components/operator-profile-client-section"

export const revalidate = 3600 // Revalidate every hour

export default async function OperatorProfilePage({ params }: { params: { operatorName: string } }) {
  const operatorName = decodeURIComponent(params.operatorName)
  const operator = await getOperatorByName(operatorName)

  if (!operator) {
    notFound()
  }

  const averageRating =
    operator.reviews && operator.reviews.length > 0
      ? operator.reviews.reduce((acc, review) => acc + review.rating, 0) / operator.reviews.length
      : 0

  return (
    <div className="relative bg-slate-900 text-white min-h-screen overflow-hidden">
      <ConstellationBackground />

      <div className="relative z-10 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 p-6 bg-slate-800/50 rounded-2xl border border-blue-800/50 shadow-2xl shadow-blue-500/10">
          <div className="relative flex-shrink-0">
            <Image
              src={operator.profile_picture_url || "/images/placeholder.svg?width=150&height=150"}
              alt={`Foto di ${operator.full_name}`}
              width={150}
              height={150}
              className="rounded-full border-4 border-amber-400 object-cover shadow-lg"
            />
            <span
              className={`absolute bottom-2 right-2 block h-6 w-6 rounded-full ${
                operator.is_online ? "bg-green-500" : "bg-gray-500"
              } border-2 border-slate-800 ring-2 ring-offset-2 ring-offset-slate-800 ${
                operator.is_online ? "ring-green-400" : "ring-gray-400"
              }`}
              title={operator.is_online ? "Online" : "Offline"}
            />
          </div>

          <div className="flex-grow text-center md:text-left">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-300 to-yellow-500">
              {operator.full_name}
            </h1>
            <p className="text-xl text-blue-300 mt-1">{operator.specialties?.join(", ") || "Nessuna specialità"}</p>

            <div className="flex items-center justify-center md:justify-start gap-4 mt-4">
              <div className="flex items-center gap-1 text-amber-400">
                <Star className="w-5 h-5" />
                <span className="font-bold text-lg">{averageRating.toFixed(1)}</span>
              </div>
              <span className="text-gray-400">({operator.reviews?.length || 0} recensioni)</span>
            </div>

            <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
              {operator.services_offered?.map((service) => (
                <span key={service} className="bg-blue-900/70 text-blue-200 px-3 py-1 rounded-full text-sm">
                  {service}
                </span>
              ))}
            </div>
          </div>

          <OperatorProfileClientSection operator={operator} />
        </div>

        {/* Main Content */}
        <div className="mt-8">
          <Tabs defaultValue="about" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-slate-800/80 border border-blue-800/50 rounded-lg">
              <TabsTrigger value="about">Chi Sono</TabsTrigger>
              <TabsTrigger value="availability">Disponibilità</TabsTrigger>
              <TabsTrigger value="reviews">Recensioni</TabsTrigger>
              <TabsTrigger value="services">Servizi e Prezzi</TabsTrigger>
            </TabsList>

            <div className="mt-4 p-6 bg-slate-800/50 rounded-2xl border border-blue-800/50 min-h-[300px]">
              <TabsContent value="about">
                <h2 className="text-2xl font-bold text-amber-400 mb-4">Un po' di me...</h2>
                <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {operator.bio || "Nessuna biografia disponibile."}
                </p>
              </TabsContent>

              <TabsContent value="availability">
                <h2 className="text-2xl font-bold text-amber-400 mb-4">Calendario Disponibilità</h2>
                <OperatorAvailabilityCalendar availability={operator.availability || []} />
              </TabsContent>

              <TabsContent value="reviews">
                <h2 className="text-2xl font-bold text-amber-400 mb-4">Recensioni dei Clienti</h2>
                <div className="space-y-4">
                  {operator.reviews && operator.reviews.length > 0 ? (
                    operator.reviews.map((review) => <ReviewCard key={review.id} review={review} />)
                  ) : (
                    <p className="text-gray-400">Nessuna recensione ancora.</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="services">
                <h2 className="text-2xl font-bold text-amber-400 mb-4">Servizi Offerti</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-900/70 p-4 rounded-lg">
                    <h3 className="font-bold text-lg text-blue-300">Consulto Telefonico</h3>
                    <p className="text-2xl font-bold text-white mt-2">€{operator.phone_consult_rate?.toFixed(2)}/min</p>
                  </div>
                  <div className="bg-slate-900/70 p-4 rounded-lg">
                    <h3 className="font-bold text-lg text-blue-300">Consulto in Chat</h3>
                    <p className="text-2xl font-bold text-white mt-2">€{operator.chat_consult_rate?.toFixed(2)}/min</p>
                  </div>
                  <div className="bg-slate-900/70 p-4 rounded-lg">
                    <h3 className="font-bold text-lg text-blue-300">Consulto Scritto</h3>
                    <p className="text-2xl font-bold text-white mt-2">€{operator.written_consult_rate?.toFixed(2)}</p>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
