"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Star, MessageCircle, Phone, Mail, Calendar, Trophy, Sun, Diamond, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/auth-context"
import { initiateChatRequest } from "@/lib/actions/chat.actions"
import { WrittenConsultationModal } from "@/components/written-consultation-modal"
import type { DetailedOperatorProfile } from "@/lib/actions/operator.actions"
import { ReviewCard } from "@/components/review-card"

interface OperatorProfileClientProps {
  operator: DetailedOperatorProfile
}

export function OperatorProfileClient({ operator }: OperatorProfileClientProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("biografia")
  const [isStartingChat, setIsStartingChat] = useState(false)
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false)

  const chatService = operator.services.find((s) => s.type === "chat")
  const callService = operator.services.find((s) => s.type === "call")
  const emailService = operator.services.find((s) => s.type === "email")

  const handleStartChat = async () => {
    if (!user) {
      alert("Devi effettuare l'accesso per avviare una chat.")
      router.push("/login")
      return
    }
    if (!operator.isOnline) {
      alert("L'operatore non è al momento online.")
      return
    }
    setIsStartingChat(true)
    try {
      // Assumendo che user.id e operator.id siano disponibili
      const result = await initiateChatRequest(user.id, operator.id)
      if (result.success && result.sessionId) {
        router.push(`/chat/${result.sessionId}`)
      } else {
        alert(`Errore: ${result.error || "Impossibile avviare la chat."}`)
      }
    } catch (error) {
      console.error("Failed to initiate chat:", error)
      alert("Si è verificato un errore tecnico. Riprova più tardi.")
    } finally {
      setIsStartingChat(false)
    }
  }

  const handleOpenEmailModal = () => {
    if (!user) {
      alert("Devi effettuare l'accesso per inviare una domanda.")
      router.push("/login")
      return
    }
    setIsEmailModalOpen(true)
  }

  const getInitials = (name: string | null) => {
    if (!name) return ""
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
  }

  return (
    <>
      <div className="container mx-auto px-4 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Card Operatore - Sinistra */}
          <div className="lg:col-span-4 space-y-6">
            {/* Profilo Operatore */}
            <Card className="rounded-2xl bg-gradient-to-br from-[#0a1a5c] via-[#1E3C98] to-[#0a1a5c] text-white backdrop-blur-lg border border-blue-400/30 shadow-2xl">
              <CardContent className="p-8 text-center">
                <Avatar className="w-32 h-32 mx-auto mb-6 border-4 border-cyan-300/50 shadow-xl">
                  <AvatarImage src={operator.avatarUrl || "/placeholder.svg"} alt={operator.fullName || "Operatore"} />
                  <AvatarFallback className="text-2xl bg-blue-900 text-white">
                    {getInitials(operator.fullName)}
                  </AvatarFallback>
                </Avatar>

                <h1 className="text-3xl font-bold text-white mb-2">{operator.fullName}</h1>
                <p className="text-blue-200 text-lg mb-4">{operator.headline}</p>

                <div className="flex items-center justify-center space-x-2 mb-4">
                  <Star className="w-5 h-5 fill-cyan-400 text-cyan-400" />
                  <span className="text-white font-bold text-lg">{operator.averageRating}</span>
                  <span className="text-blue-300">({operator.reviewsCount} rec.)</span>
                </div>

                <Badge
                  variant="secondary"
                  className={`mb-6 ${operator.isOnline ? "bg-green-500 text-white border-green-400" : "bg-gray-400 text-white border-gray-500"}`}
                >
                  {operator.isOnline ? "Online" : "Offline"}
                </Badge>

                <div className="mb-6">
                  <h3 className="text-white font-semibold mb-3 flex items-center justify-center">
                    <Trophy className="w-4 h-4 mr-2 text-cyan-500" />
                    Badge Ottenuti
                  </h3>
                  <div className="flex justify-center space-x-3">
                    {[Sun, Star, Trophy, Diamond].map((Icon, index) => (
                      <div
                        key={index}
                        className="w-12 h-12 rounded-full bg-blue-800/50 border border-cyan-200/20 flex items-center justify-center backdrop-blur-sm hover:bg-blue-700/50 transition-all duration-300 hover:scale-110"
                      >
                        <Icon className={`w-6 h-6 text-cyan-400`} />
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
                {Object.entries(operator.availability).map(([day, hours]) => (
                  <div
                    key={day}
                    className="bg-[#1E3C98]/20 rounded-xl p-4 border border-blue-600/50 backdrop-blur-sm hover:bg-[#1E3C98]/40 transition-all duration-300"
                  >
                    <h4 className="font-semibold text-white mb-2 capitalize">{day}</h4>
                    {hours.length === 0 ? (
                      <p className="text-blue-300 italic text-sm">Non disponibile</p>
                    ) : (
                      <div className="space-y-1">
                        {hours.map((timeSlot, index) => (
                          <p key={index} className="text-blue-100 text-sm font-medium bg-blue-800/50 rounded px-2 py-1">
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
                  <Button
                    onClick={handleStartChat}
                    disabled={!operator.isOnline || isStartingChat || !chatService}
                    className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-6 px-4 text-sm font-semibold shadow-lg transition-all duration-300 hover:shadow-xl flex flex-col items-center justify-center min-h-[80px] border border-cyan-300/30"
                  >
                    {isStartingChat ? (
                      <Loader2 className="w-5 h-5 mb-1 animate-spin" />
                    ) : (
                      <MessageCircle className="w-5 h-5 mb-1" />
                    )}
                    <div className="text-center leading-tight">
                      <div>{isStartingChat ? "Avvio..." : "Avvia Chat Ora"}</div>
                      {chatService && <div className="text-xs mt-1">{chatService.price?.toFixed(2)}€/min</div>}
                      {!operator.isOnline && <div className="text-xs opacity-75">(Offline)</div>}
                    </div>
                  </Button>
                  <Button
                    className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-6 px-4 text-sm font-semibold shadow-lg transition-all duration-300 hover:shadow-xl flex flex-col items-center justify-center min-h-[80px] border border-cyan-300/30"
                    disabled={!operator.isOnline || !callService}
                  >
                    <Phone className="w-5 h-5 mb-1" />
                    <div className="text-center leading-tight">
                      <div>Chiama</div>
                      {callService && <div className="text-xs mt-1">{callService.price?.toFixed(2)}€/min</div>}
                    </div>
                  </Button>
                  <Button
                    onClick={handleOpenEmailModal}
                    disabled={!emailService}
                    className="bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-800 hover:to-blue-900 text-white py-6 px-4 text-sm font-semibold shadow-lg transition-all duration-300 hover:shadow-xl flex flex-col items-center justify-center min-h-[80px] border border-cyan-300/30"
                  >
                    <Mail className="w-5 h-5 mb-1" />
                    <div className="text-center leading-tight">
                      <div>Email</div>
                      {emailService && <div className="text-xs mt-1">{emailService.price?.toFixed(2)}€/consulto</div>}
                    </div>
                  </Button>
                </div>

                {!operator.isOnline && (
                  <div className="bg-gradient-to-r from-blue-900/50 via-[#1E3C98]/30 to-blue-900/50 border border-blue-700/50 rounded-xl p-4 flex items-center backdrop-blur-sm">
                    <div className="w-6 h-6 text-yellow-400 mr-3">⚠️</div>
                    <p className="text-blue-100 font-medium">
                      L'operatore è attualmente offline. Puoi comunque richiedere una consulenza via email.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-2xl bg-gradient-to-br from-[#0a1a5c] via-[#1E3C98] to-[#0a1a5c] text-white backdrop-blur-lg border border-blue-400/30 shadow-2xl overflow-hidden">
              <div className="flex border-b border-blue-700/50">
                <button
                  onClick={() => setActiveTab("biografia")}
                  className={`px-8 py-4 font-medium transition-all duration-300 ${
                    activeTab === "biografia"
                      ? "text-white border-b-2 border-cyan-400 bg-[#1E3C98]/30"
                      : "text-blue-300 hover:text-white hover:bg-[#1E3C98]/20"
                  }`}
                >
                  Biografia
                </button>
                <button
                  onClick={() => setActiveTab("specializzazioni")}
                  className={`px-8 py-4 font-medium transition-all duration-300 ${
                    activeTab === "specializzazioni"
                      ? "text-white border-b-2 border-cyan-400 bg-[#1E3C98]/30"
                      : "text-blue-300 hover:text-white hover:bg-[#1E3C98]/20"
                  }`}
                >
                  Specializzazioni
                </button>
              </div>

              <CardContent className="p-8">
                {activeTab === "biografia" && (
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-4">La Mia Storia</h3>
                    <p className="text-blue-100 leading-relaxed text-lg">{operator.bio}</p>
                  </div>
                )}
                {activeTab === "specializzazioni" && (
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-6">Le Mie Specializzazioni</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {operator.specializations.map((specialty, index) => (
                        <div
                          key={index}
                          className="bg-gradient-to-br from-[#1E3C98]/40 via-[#1E3C98]/20 to-transparent rounded-xl p-6 border border-blue-600/50 backdrop-blur-sm hover:from-[#1E3C98]/60 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer"
                        >
                          <h4 className="font-semibold text-white mb-2 text-lg capitalize">{specialty}</h4>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-2xl bg-gradient-to-br from-[#0a1a5c] via-[#1E3C98] to-[#0a1a5c] text-white backdrop-blur-lg border border-blue-400/30 shadow-2xl">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl text-white flex items-center">
                    <Star className="w-5 h-5 mr-2 text-cyan-400" />
                    Recensioni dei Clienti
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {operator.reviews.length > 0 ? (
                  operator.reviews.map((review) => <ReviewCard key={review.id} review={review} />)
                ) : (
                  <p className="text-blue-200 text-center py-4">Questo operatore non ha ancora ricevuto recensioni.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      {emailService && (
        <WrittenConsultationModal
          isOpen={isEmailModalOpen}
          onClose={() => setIsEmailModalOpen(false)}
          operator={{
            id: operator.id,
            name: operator.fullName || "Operatore",
            emailPrice: emailService.price || 0,
          }}
        />
      )}
    </>
  )
}
