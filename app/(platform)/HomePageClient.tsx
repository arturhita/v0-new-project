"use client"

import { useEffect, useState } from "react"
import { getFeaturedOperators, getRecentReviews } from "@/lib/actions/data.actions"
import type { Operator } from "@/components/operator-card"
import OperatorCard from "@/components/operator-card"
import type { Review } from "@/components/review-card"
import ReviewCard from "@/components/review-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Loader2, Star, Users } from "lucide-react"
import ConstellationBackground from "@/components/constellation-background"

export default function HomePageClient() {
  const [operators, setOperators] = useState<Operator[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [operatorsData, reviewsData] = await Promise.all([getFeaturedOperators(), getRecentReviews()])
        setOperators(operatorsData)
        setReviews(reviewsData)
      } catch (error) {
        console.error("Failed to fetch homepage data:", error)
        // Handle error state if necessary
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="relative text-white">
      <ConstellationBackground />

      {/* Hero Section */}
      <section className="relative z-10 text-center py-20 md:py-32 px-4 bg-gradient-to-b from-transparent to-gray-900/80">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-500 mb-4 animate-fade-in-down">
            Scopri il Tuo Futuro, Oggi.
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-8 animate-fade-in-up">
            Connettiti con i migliori esperti di cartomanzia, astrologia e benessere. Ricevi consulenze personalizzate e
            risposte immediate.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up animation-delay-300">
            <Button
              asChild
              size="lg"
              className="font-bold text-[#1E3C98] bg-yellow-400 hover:bg-yellow-300 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 w-full sm:w-auto"
            >
              <Link href="/esperti/cartomanzia">
                <Star className="mr-2 h-5 w-5" />
                Trova il tuo Esperto
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="text-white border-white/80 hover:bg-white hover:text-[#1E3C98] font-semibold transition-colors duration-300 bg-transparent w-full sm:w-auto"
            >
              <Link href="/diventa-esperto">
                <Users className="mr-2 h-5 w-5" />
                Diventa un Esperto
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Operators Section */}
      <section className="relative z-10 py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-12">I Nostri Esperti in Evidenza</h2>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-12 w-12 text-yellow-400 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {operators.map((operator) => (
                <OperatorCard key={operator.id} operator={operator} showNewBadge />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Recent Reviews Section */}
      <section className="relative z-10 py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-900 to-[#1E3C98]/20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-12">Cosa Dicono i Nostri Utenti</h2>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-12 w-12 text-yellow-400 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
