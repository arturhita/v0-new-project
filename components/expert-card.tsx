"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Phone, Star, MessageSquare, Mail, Eye, Gift, Sparkles } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

interface ExpertCardProps {
  expert: {
    id: number
    name: string
    specialty: string
    rating: number
    reviews: number
    status: string
    avatar: string
    specialties: string[]
    description: string
    services: {
      chat: { available: boolean; price: number }
      call: { available: boolean; price: number }
      email: { available: boolean; price: number }
    }
  }
  userCredits?: number
  isLoggedIn?: boolean
}

export function ExpertCard({ expert, userCredits = 0, isLoggedIn = false }: ExpertCardProps) {
  const [freeMinutes, setFreeMinutes] = useState(0)
  const [freeMinutesUsed, setFreeMinutesUsed] = useState(false)
  const [isNewUser, setIsNewUser] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Controlla se l'utente ha minuti gratuiti disponibili
    if (isLoggedIn) {
      const userData = localStorage.getItem("userData")
      if (userData) {
        const parsedUserData = JSON.parse(userData)
        setFreeMinutes(parsedUserData.freeMinutes || 0)
        setFreeMinutesUsed(parsedUserData.freeMinutesUsed || false)
        setIsNewUser(parsedUserData.isNewUser || false)
      }
    }
  }, [isLoggedIn])

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "online":
        return { color: "bg-green-400", text: "Online", canContact: true }
      case "busy":
        return { color: "bg-red-400", text: "Occupato", canContact: false }
      case "offline":
        return { color: "bg-gray-400", text: "Offline", canContact: false }
      default:
        return { color: "bg-gray-400", text: "Sconosciuto", canContact: false }
    }
  }

  const getAvailableServices = () => {
    return Object.entries(expert.services)
      .filter(([_, service]: [string, any]) => service.available)
      .map(([serviceType, service]: [string, any]) => ({ type: serviceType, ...service }))
  }

  const canUseFreeMinutes = freeMinutes > 0 && !freeMinutesUsed && isNewUser && isLoggedIn

  const handleServiceClick = (serviceType: string) => {
    if (!isLoggedIn) {
      // Reindirizza al login invece di mostrare solo il toast
      window.location.href = "/login"
      return
    }

    const service = expert.services[serviceType as keyof typeof expert.services]
    if (!service || !service.available) {
      toast({
        title: "Servizio non disponibile",
        description: "Questo servizio non è attualmente disponibile.",
        variant: "destructive",
      })
      return
    }

    // Se può usare i minuti gratuiti per chat/call
    if ((serviceType === "chat" || serviceType === "call") && canUseFreeMinutes) {
      // Procedi con i minuti gratuiti
      toast({
        title: "🎁 Minuti Gratuiti Attivati!",
        description: "Stai utilizzando i tuoi 3 minuti gratuiti di benvenuto!",
      })
      return
    }

    // Controlla crediti per servizi a pagamento
    if (userCredits < service.price) {
      toast({
        title: "Crediti insufficienti",
        description: `Hai bisogno di almeno €${service.price} per questo servizio. Ricarica il tuo account.`,
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Servizio attivato",
      description: `Connessione in corso con ${expert.name}...`,
    })
  }

  const statusInfo = getStatusInfo(expert.status)
  const availableServices = getAvailableServices()

  return (
    <div className="group relative bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-pink-500/10 hover:shadow-pink-500/20 transition-all duration-500 transform hover:-translate-y-2 border border-white/20">
      {/* Gradient Border Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl"></div>

      {/* Badge minuti gratuiti per nuovi utenti */}
      {canUseFreeMinutes && (
        <div className="absolute top-4 left-4 z-10">
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white animate-pulse">
            <Gift className="w-3 h-3 mr-1" />3 MIN GRATIS
          </Badge>
        </div>
      )}

      {/* Status Indicator */}
      <div className="absolute top-4 right-4">
        <div
          className={`w-3 h-3 rounded-full ${statusInfo.color} ${expert.status === "online" ? "animate-pulse" : ""}`}
        ></div>
      </div>

      {/* Expert Avatar */}
      <div className="relative mb-6">
        <div className="w-24 h-24 mx-auto relative">
          <Avatar className="w-full h-full ring-4 ring-white shadow-xl">
            <AvatarImage src={expert.avatar || "/placeholder.svg"} alt={expert.name} />
            <AvatarFallback className="bg-gradient-to-r from-pink-200 to-blue-200 text-xl font-bold">
              {expert.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Expert Info */}
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-1">{expert.name}</h3>
        <p className="text-pink-600 font-medium mb-3">{expert.specialty}</p>

        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="flex items-center bg-yellow-50 px-3 py-1 rounded-full">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
            <span className="text-sm font-medium">{expert.rating}</span>
          </div>
          <div className="text-sm text-gray-500">({expert.reviews} recensioni)</div>
        </div>

        <p className="text-sm text-gray-600 leading-relaxed mb-4">{expert.description}</p>

        <div className="flex flex-wrap gap-2 justify-center mb-6">
          {expert.specialties.map((spec) => (
            <span
              key={spec}
              className="px-3 py-1 bg-gradient-to-r from-pink-100 to-blue-100 text-pink-700 rounded-full text-xs font-medium"
            >
              {spec}
            </span>
          ))}
        </div>
      </div>

      {/* Status Message */}
      <div
        className={`text-center mb-4 p-2 rounded-lg ${
          statusInfo.canContact
            ? "bg-green-50 text-green-700"
            : expert.status === "busy"
              ? "bg-red-50 text-red-700"
              : "bg-gray-50 text-gray-700"
        }`}
      >
        <span className="text-sm font-medium">{statusInfo.text}</span>
        {expert.status === "busy" && <div className="text-xs mt-1">In consulenza</div>}
      </div>

      {/* Available Services */}
      <div className="text-center">
        <div className="text-sm text-gray-600 mb-2">Servizi disponibili:</div>
        <div className="flex flex-wrap gap-1 justify-center mb-4">
          {availableServices.map((service) => (
            <Badge
              key={service.type}
              variant="outline"
              className={`text-xs ${
                service.type === "chat"
                  ? "border-green-300 text-green-700 bg-green-50"
                  : service.type === "call"
                    ? "border-blue-300 text-blue-700 bg-blue-50"
                    : "border-purple-300 text-purple-700 bg-purple-50"
              }`}
            >
              {service.type === "chat" && "💬"}
              {service.type === "call" && "📞"}
              {service.type === "email" && "📧"}
              {service.type === "chat" ? "Chat" : service.type === "call" ? "Chiamata" : "Email"}
              {canUseFreeMinutes && (service.type === "chat" || service.type === "call")
                ? " GRATIS"
                : service.type === "email"
                  ? ` €${service.price}`
                  : ` €${service.price}/min`}
            </Badge>
          ))}
        </div>

        {availableServices.length === 0 && (
          <div className="text-xs text-gray-500 italic mb-4">Nessun servizio disponibile al momento</div>
        )}
      </div>

      {/* Action Buttons */}
      {availableServices.length > 0 && (
        <div
          className={`grid gap-2`}
          style={{ gridTemplateColumns: `repeat(${Math.min(availableServices.length + 1, 4)}, 1fr)` }}
        >
          {expert.services.chat.available && (
            <Button
              size="sm"
              onClick={() => handleServiceClick("chat")}
              disabled={!statusInfo.canContact}
              className={`bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 shadow-lg shadow-pink-500/25 rounded-xl flex-col py-3 h-auto text-xs relative ${
                !statusInfo.canContact ? "opacity-50 cursor-not-allowed" : ""
              }`}
              title={`Chat - ${canUseFreeMinutes ? "GRATIS (3 min)" : `€${expert.services.chat.price}/min`}`}
            >
              <MessageSquare className="h-3 w-3 mb-1" />
              <span>{canUseFreeMinutes ? "GRATIS" : "Chat"}</span>
              {canUseFreeMinutes && <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-yellow-300" />}
            </Button>
          )}

          {expert.services.call.available && (
            <Button
              size="sm"
              onClick={() => handleServiceClick("call")}
              disabled={!statusInfo.canContact}
              className={`bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg shadow-purple-500/25 rounded-2xl flex-col py-3 h-auto text-xs relative ${
                !statusInfo.canContact ? "opacity-50 cursor-not-allowed" : ""
              }`}
              title={`Chiamata - ${canUseFreeMinutes ? "GRATIS (3 min)" : `€${expert.services.call.price}/min`}`}
            >
              <Phone className="h-3 w-3 mb-1" />
              <span>{canUseFreeMinutes ? "GRATIS" : "Chiama"}</span>
              {canUseFreeMinutes && <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-yellow-300" />}
            </Button>
          )}

          {expert.services.email.available && (
            <Button
              size="sm"
              onClick={() => handleServiceClick("email")}
              disabled={!statusInfo.canContact}
              className={`bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg shadow-blue-500/25 rounded-full flex-col py-3 h-auto text-xs ${
                !statusInfo.canContact ? "opacity-50 cursor-not-allowed" : ""
              }`}
              title={`Email - €${expert.services.email.price}`}
            >
              <Mail className="h-3 w-3 mb-1" />
              <span>Email</span>
            </Button>
          )}

          <Link href={`/operator/${expert.id}`}>
            <Button
              size="sm"
              variant="outline"
              className="border-pink-200 text-pink-600 hover:bg-pink-50 rounded-xl shadow-lg flex-col py-3 h-auto w-full text-xs"
              title="Vedi Profilo Completo"
            >
              <Eye className="h-3 w-3 mb-1" />
              <span>Profilo</span>
            </Button>
          </Link>
        </div>
      )}

      {availableServices.length === 0 && (
        <div className="text-center">
          <Link href={`/operator/${expert.id}`}>
            <Button size="sm" variant="outline" className="border-gray-200 text-gray-600 hover:bg-gray-50">
              <Eye className="h-3 w-3 mr-1" />
              Vedi Profilo
            </Button>
          </Link>
        </div>
      )}

      {/* Messaggio per nuovi utenti */}
      {canUseFreeMinutes && (
        <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <Gift className="w-4 h-4 text-green-600" />
            <p className="text-xs text-green-800 font-medium">
              🎉 Hai 3 minuti gratuiti da utilizzare con questo consulente!
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
