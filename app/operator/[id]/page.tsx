"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CallSystem } from "@/components/call-system"
import { ChatSystem } from "@/components/chat-system"
import { EmailConsultation } from "@/components/email-consultation"
import {
  Star,
  MessageSquare,
  Calendar,
  Clock,
  Heart,
  SnowflakeIcon as Crystal,
  Sparkles,
  Award,
  Users,
  TrendingUp,
  Zap,
  Moon,
  Shield,
  Phone,
  Mail,
  AlertTriangle,
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

// Dati dell'operatore con servizi specifici
const operatorData = {
  id: 1,
  name: "Luna Stellare",
  artisticName: "Luna Stellare",
  specialty: "Cartomante & Tarocchi",
  rating: 4.9,
  reviews: 256,
  status: "online" as const, // "online" | "offline" | "busy"
  avatar: "/placeholder.svg?height=120&width=120",
  specialties: ["Tarocchi", "Cartomanzia", "Amore", "Lavoro", "Futuro"],
  languages: ["Italiano", "Inglese"],
  experience: "15 anni",
  bio: "Benvenuti nel mio mondo spirituale! Sono Luna Stellare, cartomante e lettrice di tarocchi con oltre 15 anni di esperienza nelle arti divinatorie. La mia missione è guidarvi attraverso i misteri del vostro destino, offrendo chiarezza e saggezza per illuminare il vostro cammino. Specializzata in letture d'amore, lavoro e crescita personale, utilizzo i tarocchi come ponte tra il mondo terreno e quello spirituale per portarvi le risposte che cercate.",
  consultations: 1247,
  responseTime: "< 2 min",
  // Servizi offerti dall'operatore
  services: {
    chat: { available: true, price: 2.5 },
    call: { available: true, price: 2.5 },
    email: { available: true, price: 25.0 },
  },
  availability: {
    monday: "09:00 - 18:00",
    tuesday: "09:00 - 18:00",
    wednesday: "09:00 - 18:00",
    thursday: "09:00 - 18:00",
    friday: "09:00 - 18:00",
    saturday: "10:00 - 16:00",
    sunday: "Chiuso",
  },
  achievements: [
    { title: "Top Consulente 2024", icon: "🏆", color: "from-yellow-400 to-orange-500" },
    { title: "5000+ Consulenze", icon: "⭐", color: "from-blue-400 to-purple-500" },
    { title: "Rating 4.9+", icon: "💎", color: "from-pink-400 to-rose-500" },
    { title: "Esperta Certificata", icon: "🎓", color: "from-green-400 to-teal-500" },
  ],
}

const reviews = [
  {
    id: 1,
    user: "Maria R.",
    rating: 5,
    date: "2 giorni fa",
    comment: "Luna è incredibile! Ha previsto tutto quello che è successo nella mia relazione. Consigliatissima!",
    verified: true,
    avatar: "M",
  },
  {
    id: 2,
    user: "Giuseppe M.",
    rating: 5,
    date: "1 settimana fa",
    comment: "Lettura molto precisa e dettagliata. Mi ha aiutato a prendere decisioni importanti per il lavoro.",
    verified: true,
    avatar: "G",
  },
  {
    id: 3,
    user: "Anna B.",
    rating: 4,
    date: "2 settimane fa",
    comment: "Brava cartomante, molto empatica e professionale. Tornerò sicuramente!",
    verified: true,
    avatar: "A",
  },
]

export default function OperatorProfilePage({ params }: { params: { id: string } }) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isVisible, setIsVisible] = useState(false)
  const [userCredits, setUserCredits] = useState(45.5) // Simula crediti utente
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showChatSystem, setShowChatSystem] = useState(false)
  const [showEmailConsultation, setShowEmailConsultation] = useState(false)
  const { toast } = useToast()
  const [freeMinutes, setFreeMinutes] = useState(0)
  const [freeMinutesUsed, setFreeMinutesUsed] = useState(false)
  const [isNewUser, setIsNewUser] = useState(false)

  useEffect(() => {
    const checkLoginStatus = () => {
      try {
        const user = localStorage.getItem("user")
        const role = localStorage.getItem("userRole")
        const userData = localStorage.getItem("userData")

        if (user && role && userData) {
          setIsLoggedIn(true)
          const parsedUserData = JSON.parse(userData)
          setUserCredits(parsedUserData.credits || 0)
        } else {
          setIsLoggedIn(false)
          setUserCredits(0)
        }
      } catch (error) {
        console.error("Errore controllo login:", error)
        setIsLoggedIn(false)
        setUserCredits(0)
      }
    }

    // Controlla subito al caricamento
    checkLoginStatus()

    // Ascolta cambiamenti localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "user" || e.key === "userRole" || e.key === "userData") {
        checkLoginStatus()
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  useEffect(() => {
    setIsVisible(true)
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  useEffect(() => {
    if (isLoggedIn) {
      const userData = localStorage.getItem("userData")
      if (userData) {
        const parsedUserData = JSON.parse(userData)
        setFreeMinutes(parsedUserData.freeMinutes || 0)
        setFreeMinutesUsed(parsedUserData.freeMinutesUsed || false)
        setIsNewUser(parsedUserData.isNewUser || false)
      }
    } else {
      // Reset se non loggato
      setFreeMinutes(0)
      setFreeMinutesUsed(false)
      setIsNewUser(false)
    }
  }, [isLoggedIn])

  // Calcola servizi disponibili
  const availableServices = Object.entries(operatorData.services)
    .filter(([_, service]) => service.available)
    .map(([serviceType, service]) => ({ type: serviceType, ...service }))

  const getStatusInfo = () => {
    switch (operatorData.status) {
      case "online":
        return {
          color: "bg-green-400",
          text: "Online",
          canContact: true,
          message: "Disponibile per consulenze",
        }
      case "busy":
        return {
          color: "bg-red-400",
          text: "Occupato",
          canContact: false,
          message: "In consulenza, riprova più tardi",
        }
      case "offline":
        return {
          color: "bg-gray-400",
          text: "Offline",
          canContact: false,
          message: "Non disponibile al momento",
        }
      default:
        return {
          color: "bg-gray-400",
          text: "Sconosciuto",
          canContact: false,
          message: "Stato non disponibile",
        }
    }
  }

  const statusInfo = getStatusInfo()

  const handleServiceClick = (serviceType: string) => {
    // Controllo login
    if (!isLoggedIn) {
      toast({
        title: "Accesso richiesto",
        description: "Devi effettuare l'accesso per utilizzare questo servizio.",
        variant: "destructive",
      })
      return
    }

    const service = operatorData.services[serviceType as keyof typeof operatorData.services]
    if (!service || !service.available) {
      toast({
        title: "Servizio non disponibile",
        description: "Questo servizio non è attualmente disponibile.",
        variant: "destructive",
      })
      return
    }

    // Controllo crediti
    if (userCredits < service.price) {
      toast({
        title: "Crediti insufficienti",
        description: `Hai bisogno di almeno €${service.price} per questo servizio.`,
        variant: "destructive",
      })
      return
    }

    // Controllo stato operatore
    if (!statusInfo.canContact) {
      toast({
        title: "Operatore non disponibile",
        description: statusInfo.message,
        variant: "destructive",
      })
      return
    }

    switch (serviceType) {
      case "chat":
        setShowChatSystem(true)
        break
      case "email":
        setShowEmailConsultation(true)
        break
      case "call":
        // CallSystem è già gestito nel componente esistente
        break
    }
  }

  // Aggiorna la sezione dei servizi disponibili per leggere i dati reali
  useEffect(() => {
    // In un'app reale, questi dati verrebbero dal database
    // Per ora simula la lettura dal localStorage
    const savedServices = localStorage.getItem("operatorServices")
    if (savedServices) {
      const services = JSON.parse(savedServices)
      // Aggiorna operatorData.services con i dati salvati
      console.log("Servizi caricati dal profilo:", services)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Mouse Follower */}
      <div
        className="fixed w-6 h-6 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full pointer-events-none z-50 mix-blend-difference transition-transform duration-100"
        style={{
          left: mousePosition.x - 12,
          top: mousePosition.y - 12,
          transform: `scale(${isFavorite ? 1.5 : 1})`,
        }}
      />

      {/* Header */}
      <header className="relative z-40 border-b border-white/10 bg-black/20 backdrop-blur-xl sticky top-0">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Crystal className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
              ConsultaPro
            </span>
          </Link>
          <div className="flex items-center space-x-4">
            {!isLoggedIn ? (
              <>
                <Link href="/login">
                  <Button
                    variant="ghost"
                    className="text-white/80 hover:text-white hover:bg-white/10 border border-white/20"
                  >
                    Accedi
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 shadow-lg shadow-pink-500/25">
                    Registrati
                  </Button>
                </Link>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Badge className="bg-green-500 text-white">€{userCredits.toFixed(2)}</Badge>
                <Link href="/dashboard/user">
                  <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10">
                    Dashboard
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Hero Section */}
        <div
          className={`transform transition-all duration-1000 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
        >
          <div className="relative mb-16">
            {/* Main Profile Card */}
            <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl rounded-3xl border border-white/20 p-8 shadow-2xl shadow-black/20">
              {/* Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-r from-pink-500/30 to-purple-500/30 rounded-full blur-xl"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 rounded-full blur-xl"></div>

              <div className="relative grid lg:grid-cols-3 gap-8 items-center">
                {/* Avatar Section */}
                <div className="lg:col-span-1 flex flex-col items-center space-y-6">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <Avatar className="relative w-40 h-40 ring-4 ring-white/30 shadow-2xl group-hover:scale-105 transition-transform duration-300">
                      <AvatarImage src={operatorData.avatar || "/placeholder.svg"} alt={operatorData.name} />
                      <AvatarFallback className="bg-gradient-to-r from-pink-200 to-purple-200 text-4xl font-bold">
                        {operatorData.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>

                    {/* Status Indicator */}
                    <div className="absolute -bottom-2 -right-2 flex items-center space-x-2">
                      <div
                        className={`w-6 h-6 rounded-full ${statusInfo.color} ${operatorData.status === "online" ? "animate-pulse" : ""} ring-4 ring-white/50 shadow-lg`}
                      ></div>
                    </div>

                    {/* Floating Icons */}
                    <div className="absolute -top-8 -left-8 animate-float">
                      <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                        <Crystal className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="absolute -top-4 -right-8 animate-float delay-1000">
                      <div className="w-10 h-10 bg-gradient-to-r from-pink-400 to-rose-500 rounded-full flex items-center justify-center shadow-lg">
                        <Sparkles className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-4 w-full">
                    <div className="text-center p-4 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-2xl backdrop-blur-sm border border-white/10">
                      <div className="text-2xl font-bold text-white">{operatorData.consultations}</div>
                      <div className="text-sm text-white/70">Consulenze</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl backdrop-blur-sm border border-white/10">
                      <div className="text-2xl font-bold text-white">{operatorData.rating}</div>
                      <div className="text-sm text-white/70">Rating</div>
                    </div>
                  </div>
                </div>

                {/* Info Section */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white via-pink-200 to-purple-200 bg-clip-text text-transparent mb-2">
                          {operatorData.name}
                        </h1>
                        <p className="text-xl text-pink-300 font-medium">{operatorData.specialty}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="lg"
                        onClick={() => setIsFavorite(!isFavorite)}
                        className={`${isFavorite ? "text-red-400" : "text-white/60"} hover:text-red-400 hover:bg-white/10 transition-all duration-300`}
                      >
                        <Heart className={`h-8 w-8 ${isFavorite ? "fill-current animate-pulse" : ""}`} />
                      </Button>
                    </div>

                    {/* Status Message */}
                    <div
                      className={`flex items-center space-x-3 p-4 rounded-lg ${
                        statusInfo.canContact
                          ? "bg-green-500/20 border border-green-400/30"
                          : "bg-red-500/20 border border-red-400/30"
                      }`}
                    >
                      {statusInfo.canContact ? (
                        <Sparkles className="h-5 w-5 text-green-400" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-red-400" />
                      )}
                      <span className={`font-medium ${statusInfo.canContact ? "text-green-300" : "text-red-300"}`}>
                        {statusInfo.message}
                      </span>
                    </div>

                    {/* Rating and Reviews */}
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center bg-gradient-to-r from-yellow-500/20 to-orange-500/20 px-6 py-3 rounded-full backdrop-blur-sm border border-yellow-400/30">
                        <Star className="h-6 w-6 fill-yellow-400 text-yellow-400 mr-2" />
                        <span className="font-bold text-2xl text-white">{operatorData.rating}</span>
                        <span className="text-white/70 ml-2">({operatorData.reviews} recensioni)</span>
                      </div>
                      <div className="text-white/70">
                        <span className="font-medium text-white">{operatorData.experience}</span> di esperienza
                      </div>
                    </div>

                    {/* Specialties */}
                    <div className="flex flex-wrap gap-3">
                      {operatorData.specialties.map((specialty, index) => (
                        <div
                          key={specialty}
                          className="px-4 py-2 bg-gradient-to-r from-pink-500/30 to-purple-500/30 rounded-full backdrop-blur-sm border border-pink-400/30 text-white font-medium hover:scale-105 transition-transform duration-300"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          {specialty}
                        </div>
                      ))}
                    </div>

                    {/* Price Range */}
                    <div className="flex items-center space-x-4">
                      <div className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                        €{Math.min(...availableServices.map((s) => s.price))}/min
                      </div>
                      <div className="text-white/70">Risposta in {operatorData.responseTime}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Centered Action Buttons */}
            <div className="flex justify-center mt-8">
              <div
                className={`grid gap-4 w-full max-w-4xl`}
                style={{ gridTemplateColumns: `repeat(${availableServices.length}, 1fr)` }}
              >
                {operatorData.services.chat.available && (
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => handleServiceClick("chat")}
                    disabled={!statusInfo.canContact || !isLoggedIn}
                    className={`w-full border-2 border-green-400/50 text-green-300 hover:bg-green-500/20 shadow-2xl shadow-green-500/30 hover:scale-110 transition-all duration-300 rounded-full px-8 backdrop-blur-sm ${
                      !statusInfo.canContact || !isLoggedIn ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <MessageSquare className="mr-2 h-5 w-5" />
                    Chat - €{operatorData.services.chat.price}/min
                  </Button>
                )}

                {operatorData.services.call.available && (
                  <div>
                    <CallSystem
                      operatorId={params.id}
                      operatorName={operatorData.name}
                      operatorPrice={operatorData.services.call.price}
                      operatorStatus={operatorData.status}
                      userCredits={userCredits}
                    />
                  </div>
                )}

                {operatorData.services.email.available && (
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => handleServiceClick("email")}
                    disabled={!statusInfo.canContact || !isLoggedIn}
                    className={`border-2 border-purple-400/50 text-purple-300 hover:bg-purple-500/20 shadow-2xl shadow-purple-500/30 hover:scale-110 transition-all duration-300 rounded-full px-8 backdrop-blur-sm ${
                      !statusInfo.canContact || !isLoggedIn ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <Mail className="mr-2 h-5 w-5" />
                    Email - €{operatorData.services.email.price}
                  </Button>
                )}
              </div>
            </div>

            {/* Login Required Message - Solo per servizi */}
            {!isLoggedIn && (
              <div className="mt-6 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm rounded-2xl border border-blue-400/30 p-6 text-center">
                <AlertTriangle className="h-8 w-8 text-blue-400 mx-auto mb-3" />
                <h3 className="text-xl font-bold text-white mb-2">Accedi per Utilizzare i Servizi</h3>
                <p className="text-white/80 mb-4">
                  Puoi vedere il profilo liberamente, ma per utilizzare i servizi di consulenza devi effettuare
                  l'accesso
                </p>
                <div className="flex gap-4 justify-center">
                  <Link href="/login">
                    <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                      Accedi per Consultare
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                      Registrati Gratis
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {/* Services Info */}
            <div className="mt-8 bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <Sparkles className="mr-2 h-5 w-5 text-pink-400" />
                Servizi Disponibili
              </h3>

              {/* Info per utenti non loggati */}
              {!isLoggedIn && (
                <div className="mt-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-sm rounded-2xl border border-yellow-400/30 p-4 text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Sparkles className="h-5 w-5 text-yellow-400" />
                    <span className="text-white font-medium">Profilo Pubblico</span>
                  </div>
                  <p className="text-white/80 text-sm">
                    Stai visualizzando il profilo pubblico. Accedi per utilizzare i servizi di consulenza.
                  </p>
                </div>
              )}

              {availableServices.length > 0 ? (
                <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${availableServices.length}, 1fr)` }}>
                  {operatorData.services.chat.available && (
                    <div className="text-center p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl backdrop-blur-sm border border-green-400/30">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2 text-green-400" />
                      <div className="font-bold text-white">€{operatorData.services.chat.price}/min</div>
                      <div className="text-sm text-green-300">Chat</div>
                      <div className="text-xs text-white/70 mt-1">Consulenza in tempo reale</div>
                    </div>
                  )}
                  {operatorData.services.call.available && (
                    <div className="text-center p-4 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl backdrop-blur-sm border border-blue-400/30">
                      <Phone className="h-8 w-8 mx-auto mb-2 text-blue-400" />
                      <div className="font-bold text-white">€{operatorData.services.call.price}/min</div>
                      <div className="text-sm text-blue-300">Chiamata</div>
                      <div className="text-xs text-white/70 mt-1">Consulenza vocale</div>
                    </div>
                  )}
                  {operatorData.services.email.available && (
                    <div className="text-center p-4 bg-gradient-to-r from-purple-500/20 to-violet-500/20 rounded-xl backdrop-blur-sm border border-purple-400/30">
                      <Mail className="h-8 w-8 mx-auto mb-2 text-purple-400" />
                      <div className="font-bold text-white">€{operatorData.services.email.price}</div>
                      <div className="text-sm text-purple-300">Email</div>
                      <div className="text-xs text-white/70 mt-1">Consulenza dettagliata</div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center p-6 bg-red-500/20 rounded-lg border border-red-400/30">
                  <h4 className="font-semibold text-red-300 mb-2">Nessun Servizio Disponibile</h4>
                  <p className="text-sm text-red-400">Questo consulente non ha ancora configurato i suoi servizi.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div
          className={`transform transition-all duration-1000 delay-300 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
        >
          <Tabs defaultValue="about" className="space-y-8">
            <TabsList className="grid w-full grid-cols-4 bg-black/20 backdrop-blur-xl border border-white/20 rounded-2xl p-2">
              <TabsTrigger
                value="about"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-500 data-[state=active]:text-white text-white/70 rounded-xl transition-all duration-300"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Chi Sono
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-500 data-[state=active]:text-white text-white/70 rounded-xl transition-all duration-300"
              >
                <Star className="mr-2 h-4 w-4" />
                Recensioni
              </TabsTrigger>
              <TabsTrigger
                value="availability"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-500 data-[state=active]:text-white text-white/70 rounded-xl transition-all duration-300"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Disponibilità
              </TabsTrigger>
              <TabsTrigger
                value="achievements"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-500 data-[state=active]:text-white text-white/70 rounded-xl transition-all duration-300"
              >
                <Award className="mr-2 h-4 w-4" />
                Riconoscimenti
              </TabsTrigger>
            </TabsList>

            {/* Tab contents remain the same as before */}
            <TabsContent value="about" className="space-y-8">
              {/* Bio Section */}
              <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl rounded-3xl border border-white/20 p-8 shadow-2xl">
                <div className="absolute top-4 right-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-pink-500/30 to-purple-500/30 rounded-full flex items-center justify-center">
                    <Moon className="h-8 w-8 text-white" />
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <Sparkles className="mr-3 h-6 w-6 text-pink-400" />
                  La Mia Storia Spirituale
                </h3>
                <p className="text-white/80 leading-relaxed text-lg mb-8">{operatorData.bio}</p>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-white text-xl mb-4 flex items-center">
                      <Crystal className="mr-2 h-5 w-5 text-pink-400" />
                      Specializzazioni
                    </h4>
                    <div className="space-y-3">
                      {operatorData.specialties.map((specialty, index) => (
                        <div
                          key={specialty}
                          className="flex items-center p-3 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-xl backdrop-blur-sm border border-pink-400/30 hover:scale-105 transition-transform duration-300"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <div className="w-2 h-2 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full mr-3"></div>
                          <span className="text-white">{specialty}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-white text-xl mb-4 flex items-center">
                      <Users className="mr-2 h-5 w-5 text-blue-400" />
                      Lingue & Info
                    </h4>
                    <div className="space-y-3">
                      {operatorData.languages.map((language, index) => (
                        <div
                          key={language}
                          className="flex items-center p-3 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl backdrop-blur-sm border border-blue-400/30 hover:scale-105 transition-transform duration-300"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <span className="text-2xl mr-3">🌍</span>
                          <span className="text-white">{language}</span>
                        </div>
                      ))}
                      <div className="flex items-center p-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl backdrop-blur-sm border border-green-400/30">
                        <Clock className="mr-3 h-5 w-5 text-green-400" />
                        <span className="text-white">{operatorData.experience} di esperienza</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Other tab contents remain the same */}
            <TabsContent value="reviews" className="space-y-8">
              <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl rounded-3xl border border-white/20 p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-bold text-white flex items-center">
                    <Star className="mr-3 h-6 w-6 text-yellow-400" />
                    Recensioni Clienti
                  </h3>
                  <div className="flex items-center space-x-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 px-6 py-3 rounded-full backdrop-blur-sm border border-yellow-400/30">
                    <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                    <span className="font-bold text-2xl text-white">{operatorData.rating}</span>
                    <span className="text-white/70">su {operatorData.reviews} recensioni</span>
                  </div>
                </div>

                <div className="space-y-6">
                  {reviews.map((review, index) => (
                    <div
                      key={review.id}
                      className="p-6 bg-gradient-to-r from-white/5 to-white/10 rounded-2xl backdrop-blur-sm border border-white/20 hover:scale-105 transition-all duration-300"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-start space-x-4">
                        <Avatar className="w-12 h-12 ring-2 ring-pink-400/50">
                          <AvatarFallback className="bg-gradient-to-r from-pink-200 to-purple-200 font-bold">
                            {review.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-3">
                              <span className="font-bold text-white">{review.user}</span>
                              {review.verified && (
                                <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                                  <Shield className="mr-1 h-3 w-3" />
                                  Verificata
                                </Badge>
                              )}
                            </div>
                            <span className="text-sm text-white/60">{review.date}</span>
                          </div>
                          <div className="flex items-center mb-3">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-600"}`}
                              />
                            ))}
                          </div>
                          <p className="text-white/80 leading-relaxed">{review.comment}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="availability" className="space-y-8">
              <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl rounded-3xl border border-white/20 p-8 shadow-2xl">
                <h3 className="text-2xl font-bold text-white mb-8 flex items-center">
                  <Calendar className="mr-3 h-6 w-6 text-blue-400" />
                  Orari di Disponibilità
                </h3>

                <div className="grid gap-4">
                  {Object.entries(operatorData.availability).map(([day, hours], index) => (
                    <div
                      key={day}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl backdrop-blur-sm border border-blue-400/30 hover:scale-105 transition-all duration-300"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full"></div>
                        <span className="font-medium text-white capitalize">
                          {day === "monday"
                            ? "Lunedì"
                            : day === "tuesday"
                              ? "Martedì"
                              : day === "wednesday"
                                ? "Mercoledì"
                                : day === "thursday"
                                  ? "Giovedì"
                                  : day === "friday"
                                    ? "Venerdì"
                                    : day === "saturday"
                                      ? "Sabato"
                                      : "Domenica"}
                        </span>
                      </div>
                      <span className={`font-bold ${hours === "Chiuso" ? "text-red-400" : "text-green-400"}`}>
                        {hours}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 p-6 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl backdrop-blur-sm border border-green-400/30">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="font-bold text-green-300">Stato Attuale: {statusInfo.text}</span>
                  </div>
                  <p className="text-white/80">{statusInfo.message}</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="achievements" className="space-y-8">
              <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl rounded-3xl border border-white/20 p-8 shadow-2xl">
                <h3 className="text-2xl font-bold text-white mb-8 flex items-center">
                  <Award className="mr-3 h-6 w-6 text-yellow-400" />
                  Riconoscimenti e Traguardi
                </h3>

                <div className="grid md:grid-cols-2 gap-6">
                  {operatorData.achievements.map((achievement, index) => (
                    <div
                      key={achievement.title}
                      className={`p-6 bg-gradient-to-r ${achievement.color} bg-opacity-20 rounded-2xl backdrop-blur-sm border border-white/20 hover:scale-105 transition-all duration-300 group`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="text-4xl group-hover:scale-110 transition-transform duration-300">
                          {achievement.icon}
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-lg">{achievement.title}</h4>
                          <p className="text-white/70 text-sm">Riconoscimento ottenuto</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 grid md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-gradient-to-r from-pink-500/20 to-rose-500/20 rounded-2xl backdrop-blur-sm border border-pink-400/30">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4 text-pink-400" />
                    <div className="text-3xl font-bold text-white mb-2">98%</div>
                    <div className="text-pink-300">Soddisfazione Clienti</div>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl backdrop-blur-sm border border-blue-400/30">
                    <Zap className="h-12 w-12 mx-auto mb-4 text-blue-400" />
                    <div className="text-3xl font-bold text-white mb-2">{operatorData.responseTime}</div>
                    <div className="text-blue-300">Tempo di Risposta</div>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl backdrop-blur-sm border border-green-400/30">
                    <Users className="h-12 w-12 mx-auto mb-4 text-green-400" />
                    <div className="text-3xl font-bold text-white mb-2">1,247</div>
                    <div className="text-green-300">Consulenze Totali</div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Chat System Modal */}
      {showChatSystem && (
        <ChatSystem
          operatorId={params.id}
          operatorName={operatorData.name}
          operatorAvatar={operatorData.avatar}
          operatorPrice={operatorData.services.chat.price}
          operatorStatus={operatorData.status}
          userCredits={userCredits}
          onClose={() => setShowChatSystem(false)}
        />
      )}

      {/* Email Consultation Modal */}
      {showEmailConsultation && (
        <EmailConsultation
          operatorId={params.id}
          operatorName={operatorData.name}
          operatorAvatar={operatorData.avatar}
          operatorPrice={operatorData.services.email.price}
          operatorStatus={operatorData.status}
          userCredits={userCredits}
          onClose={() => setShowEmailConsultation(false)}
        />
      )}

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
