"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { OperatorCard, type Operator as OperatorCardType } from "@/components/operator-card"
import type { Review as ReviewCardType } from "@/components/review-card"
import { ConstellationBackground } from "@/components/constellation-background"
import { getFeaturedOperators, getNewOperators, getTopRatedOperators } from "@/lib/actions/data.actions"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

const today = new Date()
const fiveDaysAgo = new Date(today)
fiveDaysAgo.setDate(today.getDate() - 5)
const twelveDaysAgo = new Date(today)
twelveDaysAgo.setDate(today.getDate() - 12)

export const mockOperators: OperatorCardType[] = [
  {
    id: "1",
    name: "Luna Stellare",
    avatarUrl: "/placeholder.svg?width=96&height=96",
    specialization: "Cartomante & Tarocchi",
    rating: 4.9,
    reviewsCount: 256,
    description: "Esperta in letture di tarocchi con 15 anni di esperienza, ti guiderà con chiarezza.",
    tags: ["Tarocchi", "Amore", "Lavoro", "Cartomante", "Cartomanzia"],
    isOnline: true,
    services: { chatPrice: 2.5, callPrice: 2.5 },
    joinedDate: twelveDaysAgo.toISOString(),
  },
  {
    id: "2",
    name: "Maestro Cosmos",
    avatarUrl: "/placeholder.svg?width=96&height=96",
    specialization: "Astrologo",
    rating: 4.8,
    reviewsCount: 189,
    description: "Astrologo professionista specializzato in carte natali e transiti planetari.",
    tags: ["Oroscopi", "Tema Natale", "Transiti", "Astrologia"],
    isOnline: true,
    services: { chatPrice: 3.2, callPrice: 3.2, emailPrice: 35 },
    joinedDate: "2024-05-10T10:00:00.000Z",
  },
  {
    id: "3",
    name: "Sage Aurora",
    avatarUrl: "/placeholder.svg?width=96&height=96",
    specialization: "Cartomante Sibilla",
    rating: 4.8,
    reviewsCount: 203,
    description: "Specialista in carte Sibille e previsioni future, con un tocco di intuizione.",
    tags: ["Sibille", "Futuro", "Amore", "Cartomante", "Cartomanzia"],
    isOnline: false,
    services: { chatPrice: 2.6, callPrice: 2.6, emailPrice: 26 },
    joinedDate: "2024-05-15T10:00:00.000Z",
  },
  {
    id: "4",
    name: "Elara Mistica",
    avatarUrl: "/placeholder.svg?width=96&height=96",
    specialization: "Canalizzatrice Spirituale",
    rating: 4.7,
    reviewsCount: 155,
    description: "Connettiti con le energie superiori e ricevi messaggi illuminanti per il tuo cammino.",
    tags: ["Canalizzazione", "Spiritualità", "Angeli"],
    isOnline: true,
    services: { callPrice: 3.0, emailPrice: 40 },
    joinedDate: fiveDaysAgo.toISOString(),
  },
  {
    id: "5",
    name: "Sirius Lumen",
    avatarUrl: "/placeholder.svg?width=96&height=96",
    specialization: "Guaritore Energetico",
    rating: 4.9,
    reviewsCount: 98,
    description: "Armonizza i tuoi chakra e ritrova il benessere interiore con sessioni di guarigione energetica.",
    tags: ["Energia", "Chakra", "Benessere", "Guarigione Energetica"],
    isOnline: true,
    services: { callPrice: 2.8, emailPrice: 30 },
    joinedDate: new Date().toISOString(),
  },
  {
    id: "6",
    name: "Vespera Arcana",
    avatarUrl: "/placeholder.svg?width=96&height=96",
    specialization: "Esperta di Rune",
    rating: 4.6,
    reviewsCount: 120,
    description: "Interpreta i messaggi delle antiche rune per svelare i misteri del tuo destino.",
    tags: ["Rune", "Divinazione", "Mistero"],
    isOnline: false,
    services: { chatPrice: 2.2, emailPrice: 25 },
    joinedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "7",
    name: "Orion Saggio",
    avatarUrl: "/placeholder.svg?width=96&height=96",
    specialization: "Numerologo Intuitivo",
    rating: 4.8,
    reviewsCount: 142,
    description: "Svela il potere dei numeri nella tua vita. Letture numerologiche per amore, carriera e destino.",
    tags: ["Numerologia", "Destino", "Amore", "Carriera"],
    isOnline: true,
    services: { chatPrice: 2.7, callPrice: 2.7 },
    joinedDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "8",
    name: "Lyra Celeste",
    avatarUrl: "/placeholder.svg?width=96&height=96",
    specialization: "Lettrice di Registri Akashici",
    rating: 4.9,
    reviewsCount: 115,
    description: "Accedi alla saggezza della tua anima e scopri le lezioni delle vite passate.",
    tags: ["Registri Akashici", "Anima", "Vite Passate", "Spiritualità"],
    isOnline: false,
    services: { callPrice: 3.5, emailPrice: 50 },
    joinedDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

const generateTimeAgo = (daysAgo: number, hoursAgo?: number, minutesAgo?: number): string => {
  const date = new Date()
  if (daysAgo > 0) date.setDate(date.getDate() - daysAgo)
  if (hoursAgo) date.setHours(date.getHours() - hoursAgo)
  if (minutesAgo) date.setMinutes(date.getMinutes() - minutesAgo)
  return date.toISOString()
}

export const allMockReviews: ReviewCardType[] = [
  {
    id: "r1",
    userName: "Giulia R.",
    userType: "Vip",
    operatorName: "Luna Stellare",
    rating: 5,
    comment: "Luna è incredibile! Le sue letture sono sempre accurate e piene di speranza. Mi ha aiutato tantissimo.",
    date: generateTimeAgo(0, 0, 49),
  },
  {
    id: "r2",
    userName: "Marco B.",
    userType: "Utente",
    operatorName: "Maestro Cosmos",
    rating: 5,
    comment: "Un vero professionista. L'analisi del mio tema natale è stata illuminante. Consigliatissimo!",
    date: generateTimeAgo(0, 0, 57),
  },
  {
    id: "r3",
    userName: "Sofia L.",
    userType: "Vip",
    operatorName: "Sage Aurora",
    rating: 4,
    comment:
      "Aurora è molto dolce e intuitiva. Le sue previsioni con le Sibille sono state utili e mi hanno dato conforto.",
    date: generateTimeAgo(0, 1),
  },
]

export default async function HomePage() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [featuredOperators, newOperators, topRatedOperators] = await Promise.all([
    getFeaturedOperators(),
    getNewOperators(),
    getTopRatedOperators(),
  ])

  const renderOperatorSection = (title: string, operators: any[], showNewBadge = false) => (
    <section className="py-12 md:py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 text-white">{title}</h2>
        {operators.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {operators.map((operator) => (
              <OperatorCard key={operator.id} operator={operator} showNewBadge={showNewBadge} currentUser={user} />
            ))}
          </div>
        ) : (
          <p className="text-center text-white/70">Nessun operatore trovato in questa sezione.</p>
        )}
      </div>
    </section>
  )

  return (
    <div className="relative min-h-screen bg-[#000020] overflow-hidden">
      <ConstellationBackground />

      <main className="relative z-10">
        {/* Hero Section */}
        <section
          className="relative py-20 md:py-32 text-center text-white bg-cover bg-center"
          style={{ backgroundImage: "url('/images/hero-background.png')" }}
        >
          <div className="absolute inset-0 bg-black/60"></div>
          <div className="relative container mx-auto px-4">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight">Scopri i Segreti delle Stelle</h1>
            <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8 text-white/90">
              Connettiti con i migliori astrologi, cartomanti e sensitivi. La tua guida per il futuro è a un solo click
              di distanza.
            </p>
            <div className="flex justify-center gap-4">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold text-lg px-8 py-6 rounded-full hover:scale-105 transition-transform"
              >
                <Link href="/esperti/tutti">Trova il tuo Esperto</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-2 border-white text-white font-bold text-lg px-8 py-6 rounded-full bg-transparent hover:bg-white/10 hover:scale-105 transition-transform"
              >
                <Link href="/diventa-esperto">Diventa un Esperto</Link>
              </Button>
            </div>
          </div>
        </section>

        {renderOperatorSection("I nostri esperti in primo piano", featuredOperators)}
        {renderOperatorSection("Nuovi Talenti", newOperators, true)}
        {renderOperatorSection("I più votati dai nostri utenti", topRatedOperators)}
      </main>
    </div>
  )
}
