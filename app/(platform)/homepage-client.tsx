"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import OperatorCard from "@/components/operator-card"
import ArticleCard from "@/components/article-card"
import ConstellationBackground from "@/components/constellation-background"
import type { Profile } from "@/lib/schemas"
import type { Article } from "@/lib/blog-data"

// Define a simple type for the props to avoid any type errors
type Operator = Profile & { average_rating: number | null; review_count: number | null }
type FetchedArticle = Article

interface HomepageClientProps {
  operators: Operator[]
  articles: FetchedArticle[]
}

export default function HomepageClient({ operators, articles }: HomepageClientProps) {
  return (
    <div className="relative text-white overflow-x-hidden">
      <ConstellationBackground />

      {/* Hero Section */}
      <section className="relative z-10 text-center py-20 md:py-32 px-4">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: "url('/images/hero-background.png')" }}
        ></div>
        <div className="relative z-20 max-w-4xl mx-auto">
          <img src="/images/moonthir-logo-white.png" alt="Moonthir Logo" className="mx-auto mb-6 h-20 md:h-24" />
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-shadow-lg bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-300">
            Trova le risposte che cerchi
          </h1>
          <p className="mt-6 text-lg md:text-xl max-w-2xl mx-auto text-gray-300">
            Connettiti con i migliori esperti di astrologia, tarocchi e numerologia per una consulenza personalizzata.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
            <Button
              asChild
              size="lg"
              className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-8 rounded-full transition-transform transform hover:scale-105 w-full sm:w-auto"
            >
              <Link href="/esperti">Scopri gli Esperti</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-indigo-400 text-indigo-300 hover:bg-indigo-500/20 hover:text-white font-bold py-3 px-8 rounded-full transition-transform transform hover:scale-105 w-full sm:w-auto bg-transparent"
            >
              <Link href="/register">Registrati Ora</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Operators Section */}
      <section className="relative z-10 py-16 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-10 text-indigo-300">I nostri esperti in primo piano</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {operators?.slice(0, 4).map((operator) => (
              <OperatorCard key={operator.id} operator={operator} />
            ))}
          </div>
          <div className="text-center mt-12">
            <Button
              asChild
              size="lg"
              variant="ghost"
              className="text-indigo-300 hover:text-white hover:bg-indigo-500/20"
            >
              <Link href="/esperti">Vedi tutti gli esperti</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* AstroMag Section */}
      <section className="relative z-10 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-10 text-indigo-300">Dal nostro AstroMag</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles?.slice(0, 3).map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
          <div className="text-center mt-12">
            <Button
              asChild
              size="lg"
              variant="ghost"
              className="text-indigo-300 hover:text-white hover:bg-indigo-500/20"
            >
              <Link href="/astromag">Leggi tutti gli articoli</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
