"use client"

import type { Profile } from "@/contexts/auth-context"
import type { Review } from "./review-card"
import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Star, MessageSquare, Phone, Mail, Clock, User, Info } from "lucide-react"
import { ConstellationBackground } from "./constellation-background"
import { ReviewCard } from "./review-card"

interface OperatorProfileClientProps {
  operator: Profile
  reviews: Review[]
}

export function OperatorProfileClient({ operator, reviews }: OperatorProfileClientProps) {
  const [activeTab, setActiveTab] = useState("about")

  const servicePrices = operator.service_prices as { chat?: number; call?: number; email?: number } | null

  return (
    <div className="relative overflow-hidden text-white">
      <ConstellationBackground goldVisible={true} />
      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* -- Header Profilo -- */}
        <header className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center mb-12">
          <div className="flex flex-col items-center md:items-start col-span-1 md:col-span-2">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative">
                <Image
                  src={operator.profile_image_url || "/placeholder.svg?width=128&height=128&query=avatar"}
                  alt={operator.stage_name || "Operatore"}
                  width={128}
                  height={128}
                  className="rounded-full border-4 border-yellow-400/50 shadow-lg"
                />
                {operator.is_available && (
                  <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-400 rounded-full border-2 border-slate-800 animate-pulse" />
                )}
              </div>
              <div>
                <h1 className="text-4xl font-bold text-center md:text-left">{operator.stage_name}</h1>
                <p className="text-lg text-yellow-300 text-center md:text-left">
                  {operator.specializations?.join(", ")}
                </p>
                <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                  <div className="flex items-center text-yellow-400">
                    <Star className="w-5 h-5 fill-current" />
                    <span className="ml-1 font-bold">{operator.average_rating?.toFixed(1) || "N/A"}</span>
                  </div>
                  <span className="text-slate-400">({operator.review_count || 0} recensioni)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-semibold text-center">Contatta {operator.stage_name}</h3>
            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:opacity-90"
              disabled={!operator.is_available}
            >
              <MessageSquare className="mr-2 h-5 w-5" /> Inizia Chat
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full bg-transparent border-sky-500 text-sky-300 hover:bg-sky-500/20 hover:text-white"
              disabled={!operator.is_available}
            >
              <Phone className="mr-2 h-5 w-5" /> Chiama Ora
            </Button>
          </div>
        </header>

        {/* -- Contenuto Profilo con Tab -- */}
        <Tabs defaultValue="about" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800/70 backdrop-blur-sm">
            <TabsTrigger value="about">
              <User className="mr-2 h-4 w-4" />A Proposito
            </TabsTrigger>
            <TabsTrigger value="services">
              <Info className="mr-2 h-4 w-4" />
              Servizi
            </TabsTrigger>
            <TabsTrigger value="availability">
              <Clock className="mr-2 h-4 w-4" />
              Disponibilità
            </TabsTrigger>
            <TabsTrigger value="reviews">
              <Star className="mr-2 h-4 w-4" />
              Recensioni ({reviews.length})
            </TabsTrigger>
          </TabsList>

          <div className="mt-6 bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 min-h-[300px]">
            <TabsContent value="about">
              <h3 className="text-2xl font-bold mb-4 text-yellow-300">Chi sono</h3>
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{operator.bio}</p>
            </TabsContent>

            <TabsContent value="services">
              <h3 className="text-2xl font-bold mb-4 text-yellow-300">Servizi e Tariffe</h3>
              <div className="space-y-4">
                {servicePrices?.chat && (
                  <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="text-green-400" />
                      <span className="font-semibold">Consulenza Chat</span>
                    </div>
                    <span className="font-bold text-lg">€ {servicePrices.chat.toFixed(2)} / min</span>
                  </div>
                )}
                {servicePrices?.call && (
                  <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Phone className="text-sky-400" />
                      <span className="font-semibold">Consulenza Telefonica</span>
                    </div>
                    <span className="font-bold text-lg">€ {servicePrices.call.toFixed(2)} / min</span>
                  </div>
                )}
                {servicePrices?.email && (
                  <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Mail className="text-purple-400" />
                      <span className="font-semibold">Consulto via Email</span>
                    </div>
                    <span className="font-bold text-lg">€ {servicePrices.email.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="availability">
              <h3 className="text-2xl font-bold mb-4 text-yellow-300">Orari di Disponibilità</h3>
              <p className="text-slate-400">
                Questi sono gli orari indicativi. Lo stato "Online" in tempo reale ha sempre la precedenza.
              </p>
              {/* Qui andrebbe un componente calendario per mostrare `operator.availability_schedule` */}
              <div className="mt-4 p-4 bg-slate-700/50 rounded-lg">
                <p>Componente calendario della disponibilità non ancora implementato.</p>
              </div>
            </TabsContent>

            <TabsContent value="reviews">
              <h3 className="text-2xl font-bold mb-4 text-yellow-300">Cosa dicono i clienti</h3>
              {reviews.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              ) : (
                <p className="text-slate-400">Questo operatore non ha ancora ricevuto recensioni.</p>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
