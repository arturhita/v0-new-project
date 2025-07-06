"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, ChevronRight, Star, Users, Calendar, Sparkles } from "lucide-react"
import OperatorCard from "@/components/operator-card"
import ReviewCard, { type Review as ReviewCardType } from "@/components/review-card"
import type { Profile } from "@/contexts/auth-context"
import Image from "next/image"

const categories = [
  { name: "Cartomanzia", icon: Sparkles },
  { name: "Astrologia", icon: Sparkles },
  { name: "S मीडियम", icon: Sparkles },
  { name: "Guarigione Energetica", icon: Sparkles },
]

const allMockReviews: ReviewCardType[] = [
  {
    id: "r1",
    userName: "Giulia R.",
    userType: "Vip",
    operatorName: "Luna Stellare",
    rating: 5,
    comment: "Luna è incredibile! Le sue letture sono sempre accurate e piene di speranza. Mi ha aiutato tantissimo.",
    date: new Date(Date.now() - 49 * 60 * 1000).toISOString(),
  },
  {
    id: "r2",
    userName: "Marco B.",
    userType: "Utente",
    operatorName: "Maestro Cosmos",
    rating: 5,
    comment: "Un vero professionista. L'analisi del mio tema natale è stata illuminante. Consigliatissimo!",
    date: new Date(Date.now() - 57 * 60 * 1000).toISOString(),
  },
  {
    id: "r3",
    userName: "Sofia L.",
    userType: "Vip",
    operatorName: "Sage Aurora",
    rating: 4,
    comment:
      "Aurora è molto dolce e intuitiva. Le sue previsioni con le Sibille sono state utili e mi hanno dato conforto.",
    date: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
]

interface HomeClientProps {
  initialOperators: Profile[]
}

export function HomeClient({ initialOperators }: HomeClientProps) {
  const [activeCategory, setActiveCategory] = useState("Cartomanzia")
  const [reviews] = useState<ReviewCardType[]>(allMockReviews)

  const operatorsForCategory = initialOperators
    .filter((op) => op.specializations?.some((s) => s.toLowerCase() === activeCategory.toLowerCase()))
    .map((op) => ({
      id: op.id,
      name: op.stage_name || "Operatore",
      avatarUrl: op.profile_image_url || "/placeholder.svg?width=96&height=96", // FIX: Changed avatar_url to profile_image_url
      specialization: op.specializations?.[0] || "N/A",
      rating: op.average_rating || 0,
      reviewsCount: op.review_count || 0,
      description: op.bio || "Nessuna descrizione",
      tags: op.specializations || [],
      isOnline: op.is_available || false,
      services: {
        chatPrice: op.service_prices?.chat || undefined,
        callPrice: op.service_prices?.call || undefined,
        emailPrice: op.service_prices?.email || undefined,
      },
      joinedDate: op.created_at || new Date().toISOString(),
    }))

  return (
    <div className="bg-slate-900 text-white">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 text-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/hero-background.png"
            alt="Sfondo mistico"
            layout="fill"
            objectFit="cover"
            quality={100}
            className="opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-900/80 to-slate-900"></div>
        </div>
        <div className="container relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-white to-purple-300"
          >
            Il Tuo Futuro, Svelato.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-4 max-w-2xl mx-auto text-lg text-slate-300"
          >
            Connettiti con i migliori cartomanti, astrologi e guide spirituali. Ricevi risposte chiare e guida per il
            tuo cammino.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <div className="relative w-full sm:w-auto flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                type="search"
                placeholder="Cerca un esperto o un servizio..."
                className="w-full pl-10 pr-4 py-3 rounded-full bg-slate-800 border-slate-700 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <Button className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 rounded-full px-8 py-3 text-base font-semibold transition-transform transform hover:scale-105">
              Cerca Ora
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Operators Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">I Nostri Esperti</h2>
            <p className="mt-3 text-slate-400 max-w-xl mx-auto">
              Professionisti selezionati per offrirti consulenze di alta qualità, con empatia e riservatezza.
            </p>
          </div>

          <div className="mb-8 flex justify-center flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.name}
                variant={activeCategory === category.name ? "default" : "outline"}
                onClick={() => setActiveCategory(category.name)}
                className={`rounded-full px-6 py-2 transition-all duration-300 ${
                  activeCategory === category.name
                    ? "bg-purple-600 text-white border-purple-600"
                    : "text-slate-300 border-slate-600 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <category.icon className="w-4 h-4 mr-2" />
                {category.name}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {operatorsForCategory.map((operator) => (
              <motion.div
                key={operator.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <OperatorCard {...operator} />
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button variant="ghost" className="text-purple-400 hover:text-purple-300 group">
              Vedi tutti gli esperti{" "}
              <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section className="py-16 md:py-24 bg-slate-950/50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Come Funziona</h2>
            <p className="mt-3 text-slate-400 max-w-xl mx-auto">
              Inizia il tuo percorso di scoperta in tre semplici passi.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center p-6 bg-slate-800/50 rounded-xl">
              <div className="p-4 bg-purple-900/50 rounded-full mb-4">
                <Users className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Scegli il tuo Esperto</h3>
              <p className="text-slate-400">
                Sfoglia i profili, leggi le recensioni e trova la guida spirituale perfetta per te.
              </p>
            </div>
            <div className="flex flex-col items-center p-6 bg-slate-800/50 rounded-xl">
              <div className="p-4 bg-purple-900/50 rounded-full mb-4">
                <Calendar className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Ricarica e Chiama</h3>
              <p className="text-slate-400">
                Aggiungi credito al tuo account in modo sicuro e avvia una chat o una chiamata quando vuoi.
              </p>
            </div>
            <div className="flex flex-col items-center p-6 bg-slate-800/50 rounded-xl">
              <div className="p-4 bg-purple-900/50 rounded-full mb-4">
                <Sparkles className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Ottieni le tue Risposte</h3>
              <p className="text-slate-400">
                Ricevi una consulenza personale e illuminante per fare chiarezza nella tua vita.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Le Voci dei Nostri Utenti</h2>
            <div className="flex items-center justify-center mt-3 text-amber-400">
              <Star className="w-6 h-6 fill-current" />
              <Star className="w-6 h-6 fill-current" />
              <Star className="w-6 h-6 fill-current" />
              <Star className="w-6 h-6 fill-current" />
              <Star className="w-6 h-6 fill-current" />
              <span className="ml-3 text-slate-300 font-semibold">4.9 stelle su 500+ recensioni</span>
            </div>
          </div>
          <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {reviews.map((review) => (
                <ReviewCard key={review.id} {...review} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
