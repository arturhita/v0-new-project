"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ConstellationBackground } from "@/components/constellation-background"
import OperatorCard from "@/components/operator-card"
import ArticleCard from "@/components/article-card"
import type { HomepageData } from "@/lib/actions/data.actions"
import { Search } from "lucide-react"

interface HomepageClientProps {
  initialData: HomepageData | null
}

export default function HomepageClient({ initialData }: HomepageClientProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")

  if (!initialData) {
    return (
      <div className="flex h-screen items-center justify-center text-white bg-slate-900">
        Errore nel caricamento dei dati. Riprova più tardi.
      </div>
    )
  }

  const { featuredOperators, recentArticles, categories } = initialData

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/esperti?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <div className="w-full bg-slate-900 text-white">
      {/* Hero Section */}
      <div className="relative flex h-[60vh] min-h-[450px] items-center justify-center overflow-hidden text-center">
        <ConstellationBackground />
        <div className="relative z-10 p-4">
          <h1 className="text-4xl font-bold tracking-tighter text-shadow-lg shadow-blue-500/50 md:text-6xl">
            Trova le risposte che cerchi
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300 text-shadow">
            Connettiti con i migliori esperti di astrologia, tarocchi e numerologia. La tua guida per il futuro è a un
            click di distanza.
          </p>
          <form onSubmit={handleSearch} className="mx-auto mt-8 flex max-w-xl">
            <Input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cerca un esperto o un argomento..."
              className="rounded-r-none border-slate-600 bg-white/10 placeholder:text-slate-400 focus:border-sky-500 focus:ring-sky-500"
            />
            <Button type="submit" variant="gradient" className="rounded-l-none">
              <Search className="mr-2 h-4 w-4" />
              Cerca
            </Button>
          </form>
        </div>
      </div>

      {/* Featured Operators Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold md:text-4xl">I nostri esperti in primo piano</h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {featuredOperators.map((operator) => (
              <OperatorCard key={operator.id} operator={operator} />
            ))}
          </div>
          <div className="mt-12 text-center">
            <Button onClick={() => router.push("/esperti")} variant="outline" size="lg">
              Vedi tutti gli esperti
            </Button>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      {categories && categories.length > 0 && (
        <section className="bg-slate-900/50 py-16 md:py-24">
          <div className="container mx-auto px-4">
            <h2 className="mb-12 text-center text-3xl font-bold md:text-4xl">Esplora le categorie</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
              {categories.map((category) => (
                <div
                  key={category.name}
                  onClick={() => router.push(`/esperti/${category.name.toLowerCase()}`)}
                  className="group relative aspect-video cursor-pointer overflow-hidden rounded-lg transition-transform duration-300 hover:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <img
                    src={`/images/placeholder.svg?width=400&height=225&query=astrology+${category.name}`}
                    alt={category.name}
                    className="h-full w-full object-cover"
                  />
                  <h3 className="absolute bottom-4 left-4 text-xl font-semibold text-white">{category.name}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recent Articles Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold md:text-4xl">Dal nostro AstroMag</h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {recentArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
          <div className="mt-12 text-center">
            <Button onClick={() => router.push("/astromag")} variant="outline" size="lg">
              Leggi tutti gli articoli
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
