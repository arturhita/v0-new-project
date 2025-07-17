"use client"

import { useState } from "react"
import type { OperatorPublicProfile } from "@/lib/actions/operator.actions"
import Image from "next/image"
import { Star, Award, Calendar, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { WrittenConsultationModal } from "@/components/written-consultation-modal"
import { cn } from "@/lib/utils"

type OperatorProfileClientPageProps = {
  profileData: OperatorPublicProfile
}

type Tab = "biography" | "experience" | "specializations"

export default function OperatorProfileClientPage({ profileData }: OperatorProfileClientPageProps) {
  const [activeTab, setActiveTab] = useState<Tab>("biography")

  const {
    id,
    stage_name,
    avatar_url,
    specialties, // Corretto da specialization
    bio,
    rating,
    reviews_count,
    services,
    availability,
    is_online,
    experience,
    specializations_details,
  } = profileData

  const getService = (type: "chat" | "call" | "written") => services?.find((s) => s.service_type === type)

  const chatService = getService("chat")
  const callService = getService("call")
  const writtenService = getService("written")

  const renderTabContent = () => {
    switch (activeTab) {
      case "biography":
        return <p className="text-gray-300 leading-relaxed">{bio || "Nessuna biografia disponibile."}</p>
      case "experience":
        return <p className="text-gray-300 leading-relaxed">{experience || "Nessuna esperienza descritta."}</p>
      case "specializations":
        return (
          <p className="text-gray-300 leading-relaxed">
            {specializations_details || "Nessun dettaglio sulle specializzazioni."}
          </p>
        )
      default:
        return null
    }
  }

  return (
    <div className="bg-brand-dark-blue min-h-screen text-white p-4 md:p-8">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonna Sinistra */}
          <div className="lg:col-span-1 space-y-8">
            {/* Card Profilo */}
            <div className="bg-brand-blue/80 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/10">
              <div className="relative w-32 h-32 mx-auto mb-4">
                <Image
                  src={avatar_url || "/placeholder.svg?width=128&height=128"}
                  alt={`Foto di ${stage_name}`}
                  width={128}
                  height={128}
                  className="rounded-full object-cover border-4 border-blue-400 shadow-lg"
                />
              </div>
              <h1 className="text-2xl font-bold">{stage_name}</h1>
              <p className="text-blue-300">{specialties?.join(" / ")}</p>
              <div className="flex items-center justify-center space-x-2 my-3 text-yellow-400">
                <Star className="w-5 h-5 fill-current" />
                <span>
                  {rating?.toFixed(1)} ({reviews_count} rec.)
                </span>
              </div>
              <Badge
                variant={is_online ? "default" : "secondary"}
                className={is_online ? "bg-green-500" : "bg-gray-500"}
              >
                {is_online ? "Online" : "Offline"}
              </Badge>

              <div className="mt-6 text-left">
                <h3 className="font-semibold flex items-center justify-center mb-3">
                  <Award className="w-5 h-5 mr-2 text-yellow-400" />
                  Badge Ottenuti
                </h3>
                <div className="flex justify-center space-x-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-brand-dark-blue border-2 border-blue-400" />
                  ))}
                </div>
              </div>
            </div>

            {/* Card Disponibilità */}
            <div className="bg-brand-blue/80 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <h3 className="font-semibold text-lg mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-blue-300" />
                Disponibilità Indicativa
              </h3>
              <ul className="space-y-2 text-sm">
                {availability && availability.length > 0 ? (
                  availability.map((slot, index) => (
                    <li key={index} className="flex justify-between bg-brand-dark-blue/50 p-2 rounded-md">
                      <span className="font-semibold capitalize">{slot.day}</span>
                      <span>
                        {slot.start_time} - {slot.end_time}
                      </span>
                    </li>
                  ))
                ) : (
                  <p className="text-gray-400">Nessuna disponibilità specificata.</p>
                )}
              </ul>
            </div>
          </div>

          {/* Colonna Destra */}
          <div className="lg:col-span-2 space-y-8">
            {/* Card Saluto e Azioni */}
            <div className="bg-brand-blue/80 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <h2 className="text-xl font-semibold mb-3">Un Breve Saluto</h2>
              <p className="text-gray-300 mb-6">
                Con anni di esperienza e una profonda connessione con il mondo spirituale, {stage_name} ti guida
                attraverso le complessità della vita e dell'amore. Le sue letture sono illuminanti e trasformative,
                offrendo chiarezza e speranza.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <Button
                  disabled={!is_online || !chatService}
                  className="bg-cyan-600 hover:bg-cyan-700 flex-col h-auto py-2"
                >
                  Avvia Chat Ora
                  <span className="text-xs font-normal opacity-80">
                    {chatService ? `${chatService.price.toFixed(2)}€/min` : "Non disponibile"}
                  </span>
                </Button>
                <Button
                  disabled={!is_online || !callService}
                  className="bg-blue-600 hover:bg-blue-700 flex-col h-auto py-2"
                >
                  Chiama
                  <span className="text-xs font-normal opacity-80">
                    {callService ? `${callService.price.toFixed(2)}€/min` : "Non disponibile"}
                  </span>
                </Button>
                {writtenService && (
                  <WrittenConsultationModal
                    operatorId={id}
                    operatorName={stage_name || ""}
                    price={writtenService.price}
                  />
                )}
              </div>
              {!is_online && (
                <div className="bg-yellow-500/10 text-yellow-400 text-sm p-3 rounded-lg flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-3" />
                  L'operatore è attualmente offline. Puoi comunque richiedere una consulenza via email.
                </div>
              )}
            </div>

            {/* Card Biografia */}
            <div className="bg-brand-blue/80 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="border-b border-white/10 mb-4">
                <nav className="-mb-px flex space-x-6">
                  <button
                    onClick={() => setActiveTab("biography")}
                    className={cn(
                      "whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm",
                      activeTab === "biography"
                        ? "border-blue-400 text-blue-300"
                        : "border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-300",
                    )}
                  >
                    La Mia Storia
                  </button>
                  <button
                    onClick={() => setActiveTab("experience")}
                    className={cn(
                      "whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm",
                      activeTab === "experience"
                        ? "border-blue-400 text-blue-300"
                        : "border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-300",
                    )}
                  >
                    Esperienza
                  </button>
                  <button
                    onClick={() => setActiveTab("specializations")}
                    className={cn(
                      "whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm",
                      activeTab === "specializations"
                        ? "border-blue-400 text-blue-300"
                        : "border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-300",
                    )}
                  >
                    Specializzazioni
                  </button>
                </nav>
              </div>
              <div className="prose prose-invert max-w-none">{renderTabContent()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
