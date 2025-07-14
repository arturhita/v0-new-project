import { Button } from "@/components/ui/button"
import { notFound } from "next/navigation"
import { getOperatorByStageName } from "@/lib/actions/data.actions"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Star, MessageCircle, Phone, Mail, Calendar, Trophy, Sun, Diamond } from "lucide-react"
import { SiteNavbar } from "@/components/site-navbar"
import { StartChatButton } from "@/components/start-chat-button"

// Mock reviews - Sostituire con dati reali
const mockReviews = [
  {
    id: "r1",
    userName: "Elena G.",
    rating: 5,
    comment: "Luna è straordinaria, precisa e molto empatica. Mi ha dato una nuova prospettiva.",
    date: "20 lug",
    serviceType: "Chat",
  },
]

export default async function OperatorProfilePage({ params }: { params: { operatorName: string } }) {
  const operator = await getOperatorByStageName(params.operatorName)

  if (!operator) {
    notFound()
  }

  const services = (operator.services as any) || {}
  const availability = (operator.availability as any) || {}
  const badges = [
    { icon: Sun, color: "text-cyan-500" },
    { icon: Star, color: "text-cyan-500" },
    { icon: Trophy, color: "text-cyan-600" },
    { icon: Diamond, color: "text-blue-600" },
  ] // Mock badges

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-100 to-blue-300 text-slate-800">
        <SiteNavbar />
        <div className="container mx-auto px-4 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Card Operatore - Sinistra */}
            <div className="lg:col-span-4 space-y-6">
              {/* Profilo Operatore */}
              <Card className="rounded-2xl bg-gradient-to-br from-[#0a1a5c] via-[#1E3C98] to-[#0a1a5c] text-white backdrop-blur-lg border border-blue-400/30 shadow-2xl">
                <CardContent className="p-8 text-center">
                  <Avatar className="w-32 h-32 mx-auto mb-6 border-4 border-cyan-300/50 shadow-xl">
                    <AvatarImage src={operator.avatar_url || "/placeholder.svg"} alt={operator.stage_name || ""} />
                    <AvatarFallback className="text-2xl bg-blue-900 text-white">
                      {operator.stage_name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>

                  <h1 className="text-3xl font-bold text-white mb-2">{operator.stage_name}</h1>
                  <p className="text-blue-200 text-lg mb-4">
                    {operator.categories ? operator.categories.join(" & ") : ""}
                  </p>

                  <div className="flex items-center justify-center space-x-2 mb-4">
                    <Star className="w-5 h-5 fill-cyan-400 text-cyan-400" />
                    <span className="text-white font-bold text-lg">{operator.rating || 4.9}</span>
                    <span className="text-blue-300">({operator.reviews_count || 182} rec.)</span>
                  </div>

                  <Badge
                    variant="secondary"
                    className={`mb-6 ${operator.is_online ? "bg-green-500 text-white border-green-400" : "bg-gray-400 text-white border-gray-500"}`}
                  >
                    {operator.is_online ? "Online" : "Offline"}
                  </Badge>

                  <div className="mb-6">
                    <h3 className="text-white font-semibold mb-3 flex items-center justify-center">
                      <Trophy className="w-4 h-4 mr-2 text-cyan-500" />
                      Badge Ottenuti
                    </h3>
                    <div className="flex justify-center space-x-3">
                      {badges.map((badge, index) => (
                        <div
                          key={index}
                          className="w-12 h-12 rounded-full bg-blue-800/50 border border-cyan-200/20 flex items-center justify-center backdrop-blur-sm hover:bg-blue-700/50 transition-all duration-300 hover:scale-110"
                        >
                          <badge.icon className={`w-6 h-6 ${badge.color}`} />
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Disponibilità Indicativa */}
              <Card className="rounded-2xl bg-gradient-to-br from-[#0a1a5c] via-[#1E3C98] to-[#0a1a5c] text-white backdrop-blur-lg border border-blue-400/30 shadow-2xl">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl text-white flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-blue-300" />
                    Disponibilità Indicativa
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(availability).map(([day, hours]) => (
                    <div
                      key={day}
                      className="bg-[#1E3C98]/20 rounded-xl p-4 border border-blue-600/50 backdrop-blur-sm hover:bg-[#1E3C98]/40 transition-all duration-300"
                    >
                      <h4 className="font-semibold text-white mb-2 capitalize">{day}</h4>
                      {(hours as string[]).length === 0 ? (
                        <p className="text-blue-300 italic text-sm">Non disponibile</p>
                      ) : (
                        <div className="space-y-1">
                          {(hours as string[]).map((timeSlot, index) => (
                            <p
                              key={index}
                              className="text-blue-100 text-sm font-medium bg-blue-800/50 rounded px-2 py-1"
                            >
                              {timeSlot}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Contenuto Principale - Destra */}
            <div className="lg:col-span-8 space-y-6">
              <Card className="rounded-2xl bg-gradient-to-br from-[#0a1a5c] via-[#1E3C98] to-[#0a1a5c] text-white backdrop-blur-lg border border-blue-400/30 shadow-2xl">
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    <MessageCircle className="w-6 h-6 text-blue-300 mr-3" />
                    <h2 className="text-2xl font-bold text-white">Un Breve Saluto</h2>
                  </div>
                  <p className="text-blue-100 leading-relaxed mb-8 text-lg">{operator.bio}</p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <StartChatButton
                      operatorId={operator.id}
                      isOnline={!!operator.is_online}
                      chatEnabled={!!services.chat?.enabled}
                      price={services.chat?.price_per_minute}
                    />
                    <Button
                      className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-6 px-4 text-sm font-semibold shadow-lg transition-all duration-300 hover:shadow-xl flex flex-col items-center justify-center min-h-[80px] border border-cyan-300/30"
                      disabled={!operator.is_online || !services.call?.enabled}
                    >
                      <Phone className="w-5 h-5 mb-1" />
                      <div className="text-center leading-tight">
                        <div>Chiama</div>
                        <div className="text-xs mt-1">{services.call?.price_per_minute?.toFixed(2)}€/min</div>
                      </div>
                    </Button>
                    {/* <WrittenConsultationModal> trigger here */}
                    <Button
                      className="bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-800 hover:to-blue-900 text-white py-6 px-4 text-sm font-semibold shadow-lg transition-all duration-300 hover:shadow-xl flex flex-col items-center justify-center min-h-[80px] border border-cyan-300/30"
                      disabled={!services.email?.enabled}
                    >
                      <Mail className="w-5 h-5 mb-1" />
                      <div className="text-center leading-tight">
                        <div>Email</div>
                        <div className="text-xs mt-1">{services.email?.price?.toFixed(2)}€/consulto</div>
                      </div>
                    </Button>
                  </div>

                  {!operator.is_online && (
                    <div className="bg-gradient-to-r from-blue-900/50 via-[#1E3C98]/30 to-blue-900/50 border border-blue-700/50 rounded-xl p-4 flex items-center backdrop-blur-sm">
                      <div className="w-6 h-6 text-yellow-400 mr-3">⚠️</div>
                      <p className="text-blue-100 font-medium">
                        L'operatore è attualmente offline. Puoi comunque richiedere una consulenza via email.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
