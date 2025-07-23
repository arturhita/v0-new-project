"use client"

import { useState, useEffect } from "react"
import type { Operator } from "@/components/operator-card"
import type { Review } from "@/components/review-card"
import { getHomepageData } from "@/lib/actions/data.actions"
import { Skeleton } from "@/components/ui/skeleton"
import { ConstellationBackground } from "@/components/constellation-background"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import OperatorCard from "@/components/operator-card"
import ReviewCard from "@/components/review-card"
import { Send } from "lucide-react"

interface HomepageData {
  operators: Operator[]
  reviews: Review[]
}

export default function Homepage() {
  const [data, setData] = useState<HomepageData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const homepageData = await getHomepageData()
        setData(homepageData)
        setError(null)
      } catch (e: any) {
        console.error("Error caught in component's fetchData:", e.message, e)
        setError(`Failed to load homepage data: ${e.message}`)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const renderOperatorSkeletons = () =>
    Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="w-full">
        <Skeleton className="h-[450px] w-full rounded-lg" />
      </div>
    ))

  const renderReviewSkeletons = () =>
    Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className="w-full">
        <Skeleton className="h-[200px] w-full rounded-lg" />
      </div>
    ))

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <main className="flex-grow">
        <section className="relative py-20 md:py-32 text-center text-white overflow-hidden">
          <ConstellationBackground />
          <div className="container relative z-10">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4">Trova il tuo sentiero di luce</h1>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-300 mb-8">
              Connettiti con i migliori esperti di astrologia e tarocchi per una guida personalizzata.
            </p>
            <div className="flex justify-center gap-4">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Link href="/esperti">Scopri gli Esperti</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-background bg-transparent"
              >
                <Link href="/register">Inizia Ora</Link>
              </Button>
            </div>
          </div>
        </section>

        <section id="operators" className="py-16 md:py-24 bg-background">
          <div className="container">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">I nostri Esperti</h2>
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
                {renderOperatorSkeletons()}
              </div>
            ) : error ? (
              <div className="text-center text-red-500 bg-red-100 p-4 rounded-lg">
                <p>
                  <strong>Oops! Qualcosa è andato storto.</strong>
                </p>
                <p>{error}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
                {data?.operators.map((operator) => (
                  <OperatorCard key={operator.id} {...operator} />
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="py-16 md:py-24 bg-secondary/20">
          <div className="container">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Cosa dicono di noi</h2>
            {isLoading ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">{renderReviewSkeletons()}</div>
            ) : error ? (
              <div className="text-center text-red-500 bg-red-100 p-4 rounded-lg">
                <p>Non è stato possibile caricare le recensioni.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {data?.reviews.map((review) => (
                  <ReviewCard key={review.id} {...review} />
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="container text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Hai una domanda?</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Il nostro team di supporto è qui per aiutarti. Contattaci per qualsiasi dubbio o curiosità.
            </p>
            <Button asChild size="lg">
              <Link href="/support">
                <Send className="mr-2 h-5 w-5" /> Contatta il Supporto
              </Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  )
}
