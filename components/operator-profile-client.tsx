"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Star, Phone, MessageSquare, Mail, Shield, Calendar, Clock, UserCheck } from "lucide-react"
import type { Profile } from "@/contexts/auth-context"
import type { Review } from "@/components/review-card"
import ReviewCard from "@/components/review-card"
import { useState } from "react"
import WrittenConsultationModal from "./written-consultation-modal"

interface OperatorProfileClientProps {
  operator: Profile
  reviews: Review[]
}

export default function OperatorProfileClient({ operator, reviews }: OperatorProfileClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleOpenModal = () => setIsModalOpen(true)
  const handleCloseModal = () => setIsModalOpen(false)

  const services = [
    {
      name: "Chat",
      price: operator.service_prices?.chat,
      icon: MessageSquare,
      action: () => console.log("Start Chat"),
    },
    {
      name: "Chiamata",
      price: operator.service_prices?.call,
      icon: Phone,
      action: () => console.log("Start Call"),
    },
    {
      name: "Consulto Scritto",
      price: operator.service_prices?.email,
      icon: Mail,
      action: handleOpenModal,
    },
  ].filter((service) => service.price != null)

  return (
    <div className="bg-slate-900 text-white min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Operator Card */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800/50 rounded-xl p-6 sticky top-8">
              <div className="relative w-40 h-40 mx-auto mb-4">
                <Image
                  alt={operator.stage_name || "Operatore"}
                  className="rounded-full object-cover border-4 border-purple-500"
                  layout="fill"
                  src={operator.profile_image_url || "/placeholder.svg?width=160&height=160"} // FIX: Changed avatar_url to profile_image_url
                />
                {operator.is_available && (
                  <span className="absolute bottom-2 right-2 block h-5 w-5 rounded-full bg-green-500 border-2 border-slate-800 ring-2 ring-green-500" />
                )}
              </div>
              <h1 className="text-3xl font-bold text-center">{operator.stage_name}</h1>
              <p className="text-center text-purple-400 text-lg">{operator.specializations?.[0]}</p>

              <div className="flex items-center justify-center my-4">
                <div className="flex items-center text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.round(operator.average_rating || 0) ? "fill-current" : "text-slate-600"
                      }`}
                    />
                  ))}
                </div>
                <span className="ml-2 text-slate-300">
                  {operator.average_rating?.toFixed(1)} ({operator.review_count} recensioni)
                </span>
              </div>

              <div className="space-y-3">
                {services.map((service) => (
                  <Button
                    key={service.name}
                    onClick={service.action}
                    className="w-full justify-between bg-slate-700 hover:bg-slate-600 h-14 text-lg"
                  >
                    <div className="flex items-center">
                      <service.icon className="w-6 h-6 mr-3 text-purple-400" />
                      <span>{service.name}</span>
                    </div>
                    <span className="font-semibold">
                      {service.price}€{service.name !== "Consulto Scritto" && "/min"}
                    </span>
                  </Button>
                ))}
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-slate-400">
                  <Shield className="inline w-4 h-4 mr-1" /> Pagamenti sicuri e riservati
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Tabs */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="about" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-slate-800">
                <TabsTrigger value="about">Chi Sono</TabsTrigger>
                <TabsTrigger value="reviews">Recensioni ({reviews.length})</TabsTrigger>
                <TabsTrigger value="availability">Disponibilità</TabsTrigger>
              </TabsList>
              <TabsContent value="about" className="mt-6 p-6 bg-slate-800/50 rounded-xl">
                <h2 className="text-2xl font-bold mb-4 text-purple-300">Un po' di me...</h2>
                <div className="prose prose-invert prose-p:text-slate-300 prose-strong:text-white">
                  <p>{operator.bio}</p>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-4 text-slate-300">
                  <div className="flex items-center">
                    <UserCheck className="w-5 h-5 mr-2 text-purple-400" />
                    <span>Esperto dal {new Date(operator.created_at || "").toLocaleDateString("it-IT")}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-purple-400" />
                    <span>Ultimo consulto: 2 ore fa</span>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="reviews" className="mt-6">
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <ReviewCard key={review.id} {...review} />
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="availability" className="mt-6 p-6 bg-slate-800/50 rounded-xl">
                <h2 className="text-2xl font-bold mb-4 text-purple-300">I miei orari</h2>
                <p className="text-slate-400 mb-6">
                  Questi sono i miei orari di disponibilità generali. Per appuntamenti specifici, contattami.
                </p>
                {/* Placeholder for availability calendar */}
                <div className="flex items-center justify-center h-64 bg-slate-700/50 rounded-lg">
                  <Calendar className="w-16 h-16 text-slate-500" />
                  <p className="ml-4 text-slate-400">Componente Calendario Disponibilità qui</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      <WrittenConsultationModal isOpen={isModalOpen} onClose={handleCloseModal} operator={operator} />
    </div>
  )
}
