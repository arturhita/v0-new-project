"use client"

import type { User } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"
import { ConstellationBackground } from "@/components/constellation-background"
import OperatorCard, { type Operator as OperatorType } from "@/components/operator-card"
import { ArrowRight, Search, Sparkles } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

// Dati mock per fallback
export const mockOperators: OperatorType[] = [
  {
    id: "1",
    name: "Selene",
    profilePicture: "/images/mystical-moon.png",
    specialization: "Tarocchi dell'Amore",
    description: "Guida esperta nelle questioni di cuore, svela i segreti del futuro.",
    rating: 4.9,
    reviews: 124,
    isAvailable: true,
    pricePerMinute: 1.5,
    joinedDate: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Orion",
    profilePicture: "/images/mystical-moon.png",
    specialization: "Astrologia Karmica",
    description: "Interpreta le stelle per illuminare il tuo percorso di vita e le tue relazioni.",
    rating: 4.8,
    reviews: 98,
    isAvailable: false,
    pricePerMinute: 1.8,
    joinedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    name: "Lyra",
    profilePicture: "/images/mystical-moon.png",
    specialization: "Lettura della Mano",
    description: "Svela il tuo destino e la tua personalità attraverso le linee della tua mano.",
    rating: 4.9,
    reviews: 210,
    isAvailable: true,
    pricePerMinute: 1.3,
    joinedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "4",
    name: "Draco",
    profilePicture: "/images/mystical-moon.png",
    specialization: "Rune Antiche",
    description: "Consulta le antiche rune per ottenere saggezza e consigli pratici.",
    rating: 4.7,
    reviews: 75,
    isAvailable: true,
    pricePerMinute: 1.6,
    joinedDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

interface HomePageClientProps {
  user: User | null
  operators: OperatorType[]
  newTalents: OperatorType[]
}

export default function HomePageClient({ user, operators, newTalents }: HomePageClientProps) {
  return (
    <div className="bg-[#0D1A4A] text-white min-h-screen">
      <ConstellationBackground />

      <main className="relative z-10 pt-24">
        {/* Hero Section */}
        <section className="text-center py-20 px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-200 animate-shimmer">
            Il Tuo Futuro, Svelato.
          </h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto text-gray-300 mb-8">
            Connettiti con i migliori esperti di astrologia e tarocchi. Ricevi letture personalizzate e scopri cosa ti
            riserva il destino.
          </p>
          <div className="flex justify-center items-center gap-4">
            <Button
              asChild
              className="font-bold text-[#1E3C98] bg-yellow-400 hover:bg-yellow-300 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 rounded-full px-8 py-6 text-lg"
            >
              <Link href="/register">Inizia il Tuo Viaggio</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="text-white border-white/80 hover:bg-white hover:text-[#1E3C98] font-semibold transition-colors duration-300 bg-transparent rounded-full px-8 py-6 text-lg"
            >
              <Link href="/esperti/tutti">Esplora gli Esperti</Link>
            </Button>
          </div>
        </section>

        {/* Search Section */}
        <section className="py-12 px-4">
          <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border border-white/20">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <input
                type="text"
                placeholder="Cerca un esperto o una specializzazione..."
                className="w-full bg-transparent border-b-2 border-white/50 focus:border-yellow-400 focus:ring-0 outline-none text-lg placeholder-gray-400 py-2 transition-colors"
              />
              <Button className="bg-yellow-400 text-[#1E3C98] font-bold hover:bg-yellow-300 w-full md:w-auto px-8 py-3 text-lg rounded-lg">
                <Search className="mr-2 h-5 w-5" />
                Cerca
              </Button>
            </div>
          </div>
        </section>

        {/* Featured Operators Section */}
        <section className="py-20 px-4">
          <h2 className="text-4xl font-bold text-center mb-12">I Nostri Esperti di Punta</h2>
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {operators.map((operator) => (
              <OperatorCard key={operator.id} operator={operator} />
            ))}
          </div>
          <div className="text-center mt-12">
            <Button asChild variant="ghost" className="text-yellow-400 hover:text-yellow-300 text-lg">
              <Link href="/esperti/tutti">
                Vedi tutti gli esperti <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>

        {/* New Talents Section */}
        {newTalents.length > 0 && (
          <section className="py-20 px-4 bg-white/5">
            <div className="max-w-5xl mx-auto text-center">
              <h2 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
                <Sparkles className="text-yellow-400 h-8 w-8" />
                Nuovi Talenti da Scoprire
              </h2>
              <p className="text-lg text-gray-300 mb-12">
                Dai il benvenuto ai nostri nuovi esperti, pronti a condividere la loro saggezza.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {newTalents.map((talent) => (
                  <div
                    key={talent.id}
                    className="bg-white/10 p-6 rounded-xl text-center transform hover:-translate-y-2 transition-transform duration-300"
                  >
                    <Image
                      src={talent.profilePicture || "/images/mystical-moon.png"}
                      alt={talent.name}
                      width={100}
                      height={100}
                      className="rounded-full mx-auto mb-4 border-4 border-yellow-400"
                    />
                    <h3 className="text-2xl font-bold">{talent.name}</h3>
                    <p className="text-yellow-400">{talent.specialization}</p>
                    <Button asChild variant="link" className="mt-4 text-white">
                      <Link href={`/operator/${talent.name}`}>Scopri di più</Link>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* How it works Section */}
        <section className="py-20 px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Come Funziona</h2>
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div>
              <div className="text-5xl font-bold text-yellow-400 mb-4">1</div>
              <h3 className="text-2xl font-semibold mb-2">Scegli il Tuo Esperto</h3>
              <p className="text-gray-400">
                Naviga tra i profili, leggi le recensioni e trova l'esperto perfetto per te.
              </p>
            </div>
            <div>
              <div className="text-5xl font-bold text-yellow-400 mb-4">2</div>
              <h3 className="text-2xl font-semibold mb-2">Inizia il Consulto</h3>
              <p className="text-gray-400">
                Connettiti via chat o chiamata. La tariffazione è al minuto, paghi solo per il tempo che utilizzi.
              </p>
            </div>
            <div>
              <div className="text-5xl font-bold text-yellow-400 mb-4">3</div>
              <h3 className="text-2xl font-semibold mb-2">Ottieni le Tue Risposte</h3>
              <p className="text-gray-400">
                Ricevi guida e chiarezza. Lascia una recensione per aiutare gli altri nella loro scelta.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
