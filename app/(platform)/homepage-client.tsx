"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import OperatorCard from "@/components/operator-card"
import ArticleCard from "@/components/article-card"
import Link from "next/link"
import type { HomepageData } from "@/lib/actions/data.actions"
import { ConstellationBackground } from "@/components/constellation-background"

export default function HomepageClient({ initialData }: { initialData: HomepageData }) {
  const [data, setData] = useState(initialData)

  useEffect(() => {
    setData(initialData)
  }, [initialData])

  return (
    <div className="bg-slate-900 text-white">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 text-center overflow-hidden">
        <ConstellationBackground />
        <div className="relative z-10 max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-500">
            Scopri il tuo destino, illumina il tuo cammino.
          </h1>
          <p className="mt-6 text-lg md:text-xl max-w-2xl mx-auto text-slate-300">
            Connettiti con i migliori esperti di cartomanzia e astrologia. Ricevi consulti personalizzati e risposte
            immediate per guidarti nelle scelte della vita.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="bg-yellow-400 text-slate-900 font-bold hover:bg-yellow-300 shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              <Link href="/esperti">Trova il tuo Esperto</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-slate-900 font-bold transition-colors duration-300 bg-transparent"
            >
              <Link href="/register">Inizia Ora</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Operators Section */}
      <section className="py-16 sm:py-24 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-blue-400 to-purple-400">
              I nostri Esperti in primo piano
            </h2>
            <p className="mt-4 text-lg text-slate-400">
              Selezionati per la loro esperienza, professionalità e le recensioni eccellenti.
            </p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.featuredOperators.map((operator) => (
              <OperatorCard key={operator.id} operator={operator} />
            ))}
          </div>
          <div className="mt-12 text-center">
            <Button
              asChild
              size="lg"
              variant="ghost"
              className="text-yellow-400 hover:text-yellow-300 hover:bg-slate-800"
            >
              <Link href="/esperti">Vedi tutti gli Esperti &rarr;</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Latest Articles Section */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-blue-400 to-purple-400">
              Dal nostro AstroMag
            </h2>
            <p className="mt-4 text-lg text-slate-400">
              Approfondimenti, oroscopi e curiosità dal mondo dell'astrologia e della divinazione.
            </p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {data.latestArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
          <div className="mt-12 text-center">
            <Button
              asChild
              size="lg"
              variant="ghost"
              className="text-yellow-400 hover:text-yellow-300 hover:bg-slate-800"
            >
              <Link href="/astromag">Leggi tutti gli Articoli &rarr;</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
