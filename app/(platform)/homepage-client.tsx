"use client"

import type { HomepageData } from "@/lib/actions/data.actions"
import { Button } from "@/components/ui/button"
import OperatorCard from "@/components/operator-card"
import ArticleCard from "@/components/article-card"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export default function HomepageClient({ initialData }: { initialData: HomepageData | null }) {
  if (!initialData) {
    return <div className="text-center text-red-500 py-10">Dati non disponibili.</div>
  }

  const { featuredOperators, recentArticles } = initialData

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center py-16 md:py-24 rounded-lg bg-gradient-to-br from-slate-900 to-slate-800/50 border border-slate-700 mb-16">
        <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500 mb-4">
          Il Tuo Futuro, Illuminato.
        </h1>
        <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto mb-8">
          Connettiti istantaneamente con i migliori consulenti, cartomanti ed esperti del benessere. La tua guida
          personale ti attende.
        </p>
        <Link href="/esperti/tutti">
          <Button size="lg" className="bg-amber-400 text-slate-900 hover:bg-amber-500 font-semibold">
            Trova il Tuo Esperto <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </section>

      {/* Featured Operators Section */}
      {featuredOperators && featuredOperators.length > 0 && (
        <section className="mb-16">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-slate-100">Esperti in Evidenza</h2>
            <Link href="/esperti/tutti" className="text-amber-400 hover:text-amber-300 flex items-center">
              Vedi tutti <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredOperators.map((operator) => (
              <OperatorCard key={operator.id} operator={operator} />
            ))}
          </div>
        </section>
      )}

      {/* Recent Articles Section */}
      {recentArticles && recentArticles.length > 0 && (
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-slate-100">Dal Nostro Astromag</h2>
            <Link href="/astromag" className="text-amber-400 hover:text-amber-300 flex items-center">
              Leggi tutto <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recentArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
