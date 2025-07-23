"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import OperatorCard from "@/components/operator-card"
import ArticleCard from "@/components/article-card"
import ConstellationBackground from "@/components/constellation-background"
import { ArrowRight, Search, MessageSquare, Star } from "lucide-react"
import type { Operator, Article } from "@/lib/actions/data.actions"

interface HomepageClientProps {
  operators: Operator[]
  articles: Article[]
}

export default function HomepageClient({ operators, articles }: HomepageClientProps) {
  return (
    <div className="relative bg-slate-900 text-white overflow-hidden">
      <ConstellationBackground />

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 text-center">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: "url('/images/hero-background.png')" }}
        />
        <div className="relative z-10 container mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-amber-300 to-yellow-500">
            Il viaggio inizia da qui
          </h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8 text-gray-300">
            Connettiti con i migliori esperti di astrologia, tarocchi e numerologia. Trova le risposte che cerchi,
            quando ne hai più bisogno.
          </p>
          <div className="flex justify-center">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold text-lg shadow-lg transform hover:scale-105 transition-transform duration-300"
            >
              <Link href="/esperti/cartomanti">
                <Search className="mr-2 h-5 w-5" />
                Cerca Esperti
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Operators */}
      <section className="py-16 bg-slate-900/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-2 text-amber-400">I Nostri Esperti</h2>
          <p className="text-center text-gray-400 mb-10">Una selezione dei nostri professionisti più apprezzati.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {operators.slice(0, 4).map((operator) => (
              <OperatorCard key={operator.id} operator={operator} />
            ))}
          </div>
          <div className="text-center mt-12">
            <Button
              asChild
              variant="outline"
              className="border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-slate-900 bg-transparent"
            >
              <Link href="/esperti/cartomanti">
                Vedi tutti gli esperti <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Last Operators */}
      <section className="py-16 bg-slate-900/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-2 text-amber-400">Ultimi Esperti Iscritti</h2>
          <p className="text-center text-gray-400 mb-10">Dai il benvenuto ai nuovi talenti della nostra community.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {operators.slice(-4).map((operator) => (
              <OperatorCard key={operator.id} operator={operator} />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-amber-400">Come Funziona</h2>
          <div className="grid md:grid-cols-3 gap-10 text-center">
            <div className="flex flex-col items-center">
              <div className="bg-blue-900/50 p-6 rounded-full mb-4 border-2 border-blue-700">
                <Search className="h-10 w-10 text-amber-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">1. Trova il tuo Esperto</h3>
              <p className="text-gray-400">
                Sfoglia i profili, leggi le recensioni e scegli il consulente che fa per te.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-blue-900/50 p-6 rounded-full mb-4 border-2 border-blue-700">
                <MessageSquare className="h-10 w-10 text-amber-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">2. Inizia il Consulto</h3>
              <p className="text-gray-400">Contatta l'esperto tramite chat, telefono o richiedi un consulto scritto.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-blue-900/50 p-6 rounded-full mb-4 border-2 border-blue-700">
                <Star className="h-10 w-10 text-amber-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">3. Ottieni Risposte</h3>
              <p className="text-gray-400">Ricevi la guida e la chiarezza che cerchi per affrontare le tue sfide.</p>
            </div>
          </div>
        </div>
      </section>

      {/* AstroMag Section */}
      <section className="py-16 bg-slate-900/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-10 text-amber-400">Dal Nostro AstroMag</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
          <div className="text-center mt-12">
            <Button
              asChild
              variant="outline"
              className="border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-slate-900 bg-transparent"
            >
              <Link href="/astromag">
                Leggi tutti gli articoli <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
