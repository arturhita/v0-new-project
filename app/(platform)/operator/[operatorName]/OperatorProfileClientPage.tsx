"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { Star, Award, Gem, Sparkles, CalendarDays, MessageSquare, AlertTriangle } from "lucide-react"
import type { OperatorPublicProfile } from "@/lib/actions/operator.actions"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { WrittenConsultationModal } from "@/components/written-consultation-modal"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

interface OperatorProfileClientPageProps {
  profileData: OperatorPublicProfile
}

type Tab = "biography" | "experience" | "specializations"

export default function OperatorProfileClientPage({ profileData }: OperatorProfileClientPageProps) {
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
    is_online,
    // Dati per i tab (da aggiungere al DB se necessario)
    experience,
    specializations_details,
  } = profileData

  const { user } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>("biography")
  const [isModalOpen, setIsModalOpen] = useState(false)

  const chatService = services?.find((s) => s.service_type === "chat")
  const callService = services?.find((s) => s.service_type === "call")
  const writtenService = services?.find((s) => s.service_type === "written")

  const handleActionClick = (action: () => void) => {
    if (!user) {
      router.push("/login?redirect=/operator/" + encodeURIComponent(stage_name || ""))
      return
    }
    action()
  }

  const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={cn("bg-brand-primary text-white rounded-2xl p-6 shadow-lg", className)}>{children}</div>
  )

  const TabButton = ({ tab, label }: { tab: Tab; label: string }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={cn(
        "pb-2 text-lg font-semibold transition-colors",
        activeTab === tab ? "text-white border-b-2 border-brand-accent" : "text-gray-400 hover:text-white",
      )}
    >
      {label}
    </button>
  )

  return (
    <>
      <div className="bg-brand-background min-h-screen py-8 px-4">
        <div className="container mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonna Sinistra */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="flex flex-col items-center text-center">
              <div className="relative w-32 h-32 mb-4">
                <Image
                  src={avatar_url || "/placeholder.svg?width=128&height=128"}
                  alt={`Foto di ${stage_name}`}
                  width={128}
                  height={128}
                  className="rounded-full object-cover border-4 border-white/20"
                />
              </div>
              <h1 className="text-2xl font-bold">{stage_name}</h1>
              <p className="text-brand-accent mb-2">{(specialization || []).join(", ")}</p>
              <div className="flex items-center space-x-2 mb-4">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <span className="font-semibold">
                  {rating?.toFixed(1)} ({reviews_count} rec.)
                </span>
              </div>
              <div
                className={cn(
                  "px-4 py-1 rounded-full text-sm font-semibold",
                  is_online ? "bg-green-500/20 text-green-300" : "bg-gray-500/20 text-gray-300",
                )}
              >
                {is_online ? "Online" : "Offline"}
              </div>
              <div className="w-full border-t border-white/10 my-6" />
              <h3 className="font-semibold mb-4">Badge Ottenuti</h3>
              <div className="flex justify-center space-x-4">
                <Sparkles className="w-8 h-8 text-brand-accent/50" />
                <Star className="w-8 h-8 text-brand-accent/50" />
                <Award className="w-8 h-8 text-brand-accent" />
                <Gem className="w-8 h-8 text-brand-accent/50" />
              </div>
            </Card>

            <Card>
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <CalendarDays className="w-5 h-5 mr-2 text-brand-accent" />
                Disponibilità Indicativa
              </h2>
              <ul className="space-y-2 text-gray-300">
                {availability?.map((slot: any, index: number) => (
                  <li key={index} className="flex justify-between bg-brand-primary-light p-2 rounded-md">
                    <span>{slot.day}</span>
                    <span>
                      {slot.start_time} - {slot.end_time}
                    </span>
                  </li>
                ))}
                {!availability?.length && <p>Nessuna disponibilità specificata.</p>}
              </ul>
            </Card>
          </div>

          {/* Colonna Destra */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <MessageSquare className="w-5 h-5 mr-2 text-brand-accent" />
                Un Breve Saluto
              </h2>
              <p className="text-gray-300 mb-6">{bio?.substring(0, 200)}...</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <Button
                  onClick={() => handleActionClick(() => router.push(`/chat/new?operatorId=${id}`))}
                  disabled={!is_online}
                  className="bg-brand-secondary hover:bg-brand-secondary/80 h-auto text-left flex flex-col items-start p-3"
                >
                  <span className="font-bold">Avvia Chat Ora</span>
                  <span className="text-xs">{chatService ? `${chatService.price.toFixed(2)}€/min` : ""}</span>
                  <span className="text-xs text-gray-300">{!is_online && "(Offline)"}</span>
                </Button>
                <Button
                  onClick={() => handleActionClick(() => router.push(`/call/new?operatorId=${id}`))}
                  disabled={!is_online}
                  className="bg-brand-secondary hover:bg-brand-secondary/80 h-auto text-left flex flex-col items-start p-3"
                >
                  <span className="font-bold">Chiama</span>
                  <span className="text-xs">{callService ? `${callService.price.toFixed(2)}€/min` : ""}</span>
                </Button>
                <Button
                  onClick={() => handleActionClick(() => setIsModalOpen(true))}
                  className="bg-brand-primary-light hover:bg-brand-primary-light/80 h-auto text-left flex flex-col items-start p-3"
                >
                  <span className="font-bold">Email</span>
                  <span className="text-xs">
                    {writtenService ? `${writtenService.price.toFixed(2)}€/consulto` : ""}
                  </span>
                </Button>
              </div>
              {!is_online && (
                <div className="bg-yellow-500/10 text-yellow-300 text-sm p-3 rounded-lg flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-3" />
                  L'operatore è attualmente offline. Puoi comunque richiedere una consulenza via email.
                </div>
              )}
            </Card>

            <Card>
              <div className="flex space-x-8 border-b border-white/10 mb-6">
                <TabButton tab="biography" label="Biografia" />
                <TabButton tab="experience" label="Esperienza" />
                <TabButton tab="specializations" label="Specializzazioni" />
              </div>
              <div>
                {activeTab === "biography" && (
                  <div>
                    <h3 className="text-2xl font-bold mb-4">La Mia Storia</h3>
                    <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{bio}</p>
                  </div>
                )}
                {activeTab === "experience" && (
                  <div>
                    <h3 className="text-2xl font-bold mb-4">La Mia Esperienza</h3>
                    <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                      {experience || "Informazioni sull'esperienza non ancora disponibili."}
                    </p>
                  </div>
                )}
                {activeTab === "specializations" && (
                  <div>
                    <h3 className="text-2xl font-bold mb-4">Le Mie Specializzazioni</h3>
                    <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                      {specializations_details || "Dettagli sulle specializzazioni non ancora disponibili."}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
      {writtenService && (
        <WrittenConsultationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          operator={{
            id: id,
            name: stage_name || "",
            emailPrice: writtenService.price,
          }}
        />
      )}
    </>
  )
}
