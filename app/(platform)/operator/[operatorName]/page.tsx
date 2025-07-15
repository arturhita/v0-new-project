"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Star, MessageCircle, Phone, Mail, Calendar, Trophy, Sun, Diamond, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SiteNavbar } from "@/components/site-navbar"
import { useAuth } from "@/contexts/auth-context"
import { initiateChatRequest } from "@/lib/actions/chat.actions"
import { WrittenConsultationModal } from "@/components/written-consultation-modal"

// Mock data per l'operatore - ID allineato con chat.actions.ts
const mockOperator = {
  id: "op_luna_stellare", // ID aggiornato
  name: "Luna Stellare",
  avatarUrl: "/placeholder.svg?width=200&height=200",
  specialization: "Cartomante Esperta in Tarocchi dell'Amore",
  rating: 4.9,
  reviewsCount: 182,
  description:
    "Con anni di esperienza e una profonda connessione con il mondo spirituale, Luna ti guida attraverso le complessità della vita e dell'amore. Le sue letture sono illuminanti e trasformative, offrendo chiarezza e speranza.",
  isOnline: true, // Messo online per test
  services: {
    chatPrice: 2.5,
    callPrice: 3.0,
    emailPrice: 30.0,
  },
  badges: [
    { icon: Sun, color: "text-cyan-500" },
    { icon: Star, color: "text-cyan-500" },
    { icon: Trophy, color: "text-cyan-600" },
    { icon: Diamond, color: "text-blue-600" },
  ],
  availability: {
    Lunedì: ["10:00 - 12:00", "15:00 - 18:00"],
    Martedì: ["14:00 - 19:00"],
    Mercoledì: ["Non disponibile"],
    Giovedì: ["10:00 - 13:00", "16:00 - 19:00"],
    Venerdì: ["15:00 - 20:00"],
    Sabato: ["10:00 - 14:00"],
    Domenica: ["Non disponibile"],
  },
  bio: "Fin da giovane ho sentito un forte legame con le energie sottili e il mondo invisibile. Ho affinato le mie capacità attraverso anni di studio e pratica, specializzandomi nei Tarocchi dell'Amore e nelle letture intuitive. La mia missione è aiutare le persone a trovare chiarezza nelle loro relazioni e nel loro percorso di vita, offrendo guidance compassionevole e precisa.",
  specialties: [
    {
      title: "Tarocchi dell'Amore",
      description: "Letture specializzate per questioni sentimentali e relazioni profonde",
    },
    {
      title: "Cartomanzia Tradizionale",
      description: "Interpretazione delle carte secondo la tradizione antica",
    },
    {
      title: "Consulti di Coppia",
      description: "Guidance per migliorare la comunicazione e l'armonia di coppia",
    },
    {
      title: "Crescita Personale",
      description: "Supporto nel percorso di evoluzione e consapevolezza interiore",
    },
  ],
}

// Mock reviews
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

export default function OperatorProfilePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("biografia")
  const [isStartingChat, setIsStartingChat] = useState(false)
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false)

  const handleStartChat = async () => {
    if (!user) {
      alert("Devi effettuare l'accesso per avviare una chat.")
      router.push("/login")
      return
    }
    if (!mockOperator.isOnline) {
      alert("L'operatore non è al momento online.")
      return
    }
    setIsStartingChat(true)
    try {
      const result = await initiateChatRequest(user.id, mockOperator.id)
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
                    <AvatarImage src={mockOperator.avatarUrl || "/placeholder.svg"} alt={mockOperator.name} />
                    <AvatarFallback className="text-2xl bg-blue-900 text-white">
                      {mockOperator.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>

                  <h1 className="text-3xl font-bold text-white mb-2">{mockOperator.name}</h1>
                  <p className="text-blue-200 text-lg mb-4">{mockOperator.specialization}</p>

                  <div className="flex items-center justify-center space-x-2 mb-4">
                    <Star className="w-5 h-5 fill-cyan-400 text-cyan-400" />
                    <span className="text-white font-bold text-lg">{mockOperator.rating}</span>
                    <span className="text-blue-300">({mockOperator.reviewsCount} rec.)</span>
                  </div>

                  <Badge
                    variant="secondary"
                    className={`mb-6 ${mockOperator.isOnline ? "bg-green-500 text-white border-green-400" : "bg-gray-400 text-white border-gray-500"}`}
                  >
                    {mockOperator.isOnline ? "Online" : "Offline"}
                  </Badge>

                  <div className="mb-6">
                    <h3 className="text-white font-semibold mb-3 flex items-center justify-center">
                      <Trophy className="w-4 h-4 mr-2 text-cyan-500" />
                      Badge Ottenuti
                    </h3>
                    <div className="flex justify-center space-x-3">
                      {mockOperator.badges.map((badge, index) => (
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
                  {Object.entries(mockOperator.availability).map(([day, hours]) => (
                    <div
                      key={day}
                      className="bg-[#1E3C98]/20 rounded-xl p-4 border border-blue-600/50 backdrop-blur-sm hover:bg-[#1E3C98]/40 transition-all duration-300"
                    >
                      <h4 className="font-semibold text-white mb-2">{day}</h4>
                      {hours[0] === "Non disponibile" ? (
                        <p className="text-blue-300 italic text-sm">{hours[0]}</p>
                      ) : (
                        <div className="space-y-1">
                          {hours.map((timeSlot, index) => (
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
                  <p className="text-blue-100 leading-relaxed mb-8 text-lg">{mockOperator.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Button
                      onClick={handleStartChat}
                      disabled={!mockOperator.isOnline || isStartingChat}
                      className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-6 px-4 text-sm font-semibold shadow-lg transition-all duration-300 hover:shadow-xl flex flex-col items-center justify-center min-h-[80px] border border-cyan-300/30"
                    >
                      {isStartingChat ? (
                        <Loader2 className="w-5 h-5 mb-1 animate-spin" />
                      ) : (
                        <MessageCircle className="w-5 h-5 mb-1" />
                      )}
                      <div className="text-center leading-tight">
                        <div>{isStartingChat ? "Avvio..." : "Avvia Chat Ora"}</div>
                        <div className="text-xs mt-1">{mockOperator.services.chatPrice.toFixed(2)}€/min</div>
                        {!mockOperator.isOnline && <div className="text-xs opacity-75">(Offline)</div>}
                      </div>
                    </Button>
                    <Button
                      className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-6 px-4 text-sm font-semibold shadow-lg transition-all duration-300 hover:shadow-xl flex flex-col items-center justify-center min-h-[80px] border border-cyan-300/30"
                      disabled={!mockOperator.isOnline}
                    >
                      <Phone className="w-5 h-5 mb-1" />
                      <div className="text-center leading-tight">
                        <div>Chiama</div>
                        <div className="text-xs mt-1">{mockOperator.services.callPrice.toFixed(2)}€/min</div>
                      </div>
                    </Button>
                    <Button
                      onClick={handleOpenEmailModal}
                      className="bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-800 hover:to-blue-900 text-white py-6 px-4 text-sm font-semibold shadow-lg transition-all duration-300 hover:shadow-xl flex flex-col items-center justify-center min-h-[80px] border border-cyan-300/30"
                    >
                      <Mail className="w-5 h-5 mb-1" />
                      <div className="text-center leading-tight">
                        <div>Email</div>
                        <div className="text-xs mt-1">{mockOperator.services.emailPrice.toFixed(2)}€/consulto</div>
                      </div>
                    </Button>
                  </div>

                  {!mockOperator.isOnline && (
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
                    onClick={() => setActiveTab("esperienza")}
                    className={`px-8 py-4 font-medium transition-all duration-300 ${
                      activeTab === "esperienza"
                        ? "text-white border-b-2 border-cyan-400 bg-[#1E3C98]/30"
                        : "text-blue-300 hover:text-white hover:bg-[#1E3C98]/20"
                    }`}
                  >
                    Esperienza
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
                      <p className="text-blue-100 leading-relaxed text-lg">{mockOperator.bio}</p>
                    </div>
                  )}

                  {activeTab === "esperienza" && (
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-6">La Mia Esperienza</h3>
                      <div className="space-y-4">
                        <div className="bg-[#1E3C98]/20 rounded-xl p-6 border border-blue-600/50 backdrop-blur-sm hover:bg-[#1E3C98]/40 hover:shadow-lg transition-all duration-300">
                          <h4 className="font-semibold text-white mb-2 text-lg">Anni di Pratica</h4>
                          <p className="text-blue-200 text-base">Oltre 15 anni di esperienza</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "specializzazioni" && (
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-6">Le Mie Specializzazioni</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {mockOperator.specialties.map((specialty, index) => (
                          <div
                            key={index}
                            className="bg-gradient-to-br from-[#1E3C98]/40 via-[#1E3C98]/20 to-transparent rounded-xl p-6 border border-blue-600/50 backdrop-blur-sm hover:from-[#1E3C98]/60 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer"
                          >
                            <h4 className="font-semibold text-white mb-2 text-lg">{specialty.title}</h4>
                            <p className="text-blue-200 text-base leading-relaxed">{specialty.description}</p>
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
                  {/* Recensioni */}
                  {/* ... resto del codice delle recensioni ... */}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      {mockOperator.services.emailPrice && (
        <WrittenConsultationModal
          isOpen={isEmailModalOpen}
          onClose={() => setIsEmailModalOpen(false)}
          operator={{
            id: mockOperator.id,
            name: mockOperator.name,
            emailPrice: mockOperator.services.emailPrice,
          }}
        />
      )}
    </>
  )
}
