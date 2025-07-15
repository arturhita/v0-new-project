"use client"

import Link from "next/link"
import { Suspense } from "react"
import { ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { OperatorCard } from "@/components/operator-card"
import { ReviewCard } from "@/components/review-card"
import { ConstellationBackground } from "@/components/constellation-background"
import { getOperators, getRecentReviews, getFeaturedOperators } from "@/lib/actions/data.actions"
import { LoadingSpinner } from "@/components/loading-spinner"

async function FeaturedOperators() {
  const operators = await getFeaturedOperators(4)
  if (operators.length === 0) {
    return <p className="text-center text-white/70">Nessun operatore in primo piano al momento.</p>
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {operators.map((operator) => (
        <OperatorCard key={operator.id} operator={operator} />
      ))}
    </div>
  )
}

async function TopOperators() {
  const operators = await getOperators({ limit: 8, sortBy: "average_rating", ascending: false })
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
      {operators.map((operator, index) => (
        <div key={operator.id} className="animate-scaleIn" style={{ animationDelay: `${index * 100}ms` }}>
          <OperatorCard operator={operator} />
        </div>
      ))}
    </div>
  )
}

async function RecentReviews() {
  const reviews = await getRecentReviews(3)
  if (reviews.length === 0) {
    return <div className="text-center text-slate-400">Ancora nessuna recensione.</div>
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
      {reviews.map((review: any, index) => (
        <div key={review.id} className="animate-scaleIn" style={{ animationDelay: `${index * 100}ms` }}>
          <ReviewCard review={review} />
        </div>
      ))}
    </div>
  )
}

async function NewTalents() {
  const operators = await getOperators({ limit: 3, sortBy: "created_at", ascending: false })
  if (operators.length === 0) return null
  return (
    <section className="py-16 md:py-24 relative bg-gradient-to-br from-blue-950 via-slate-900 to-blue-950">
      <ConstellationBackground goldVisible={true} />
      <div className="container px-4 md:px-6 relative z-10">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl font-bold md:text-4xl text-white">Nuovi talenti Moonthir</h2>
          <p className="mt-4 text-lg text-slate-300 max-w-2xl mx-auto">
            Scopri i maestri spirituali che si sono uniti di recente alla nostra comunità mistica.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {operators.map((operator, index) => (
            <div key={operator.id} className="animate-scaleIn" style={{ animationDelay: `${index * 100}ms` }}>
              <OperatorCard operator={operator} showNewBadge={true} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function UnveillyHomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-900 text-white overflow-x-hidden">
      <style jsx>{`
        @import url("https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap");
        .font-playfair {
          font-family: "Playfair Display", serif;
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 1s ease-out forwards;
        }
        .animate-scaleIn {
          animation: scaleIn 0.6s ease-out forwards;
        }
      `}</style>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative h-screen w-full flex items-center justify-center text-center text-white overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/images/hero-background.png')" }}
          >
            <div className="absolute inset-0 bg-black/40"></div>
          </div>
          <div className="relative z-10 flex flex-col items-center space-y-8 pt-20 md:pt-32 animate-fadeInUp">
            <h1
              className="font-playfair font-bold text-white text-6xl md:text-8xl"
              style={{ textShadow: "0 3px 12px rgba(0,0,0,0.8)" }}
            >
              Il Viaggio
            </h1>
            <h2
              className="font-playfair text-white text-4xl md:text-5xl"
              style={{ textShadow: "0 2px 8px rgba(0,0,0,0.7)" }}
            >
              Inizia da Qui
            </h2>
            <Link href="/esperti/cartomanzia" passHref>
              <Button
                size="lg"
                className="bg-gradient-to-r from-amber-500 to-[#1E3C98] text-white font-bold text-lg px-8 py-4 rounded-full hover:saturate-150 transition-all duration-500 shadow-lg hover:shadow-xl hover:scale-105 group"
              >
                <Sparkles className="mr-3 h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                Cerca Esperti
              </Button>
            </Link>
          </div>
        </section>

        {/* Featured Operators Section */}
        <section className="py-16 md:py-24">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">I nostri Esperti in Primo Piano</h2>
              <p className="text-white/70 mt-2">Professionisti pronti ad ascoltarti e guidarti.</p>
            </div>
            <Suspense fallback={<LoadingSpinner />}>
              <FeaturedOperators />
            </Suspense>
          </div>
        </section>

        {/* Operator Boxes Section */}
        <section className="py-16 md:py-24 relative bg-gradient-to-br from-blue-950 via-slate-900 to-blue-950 overflow-hidden">
          <ConstellationBackground goldVisible={true} />
          <div className="container px-4 md:px-6 relative z-10">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl font-bold md:text-4xl text-white">Esperti pronti ad illuminarti</h2>
              <p className="mt-4 text-lg text-slate-300 max-w-2xl mx-auto">
                Trova la tua guida spirituale, disponibile ora per svelare i misteri del tuo destino.
              </p>
            </div>
            <Suspense fallback={<LoadingSpinner />}>
              <TopOperators />
            </Suspense>
            <div className="text-center mt-12">
              <Link href="/esperti/cartomanzia" passHref>
                <Button
                  variant="default"
                  size="lg"
                  className="rounded-full px-8 py-3 text-lg bg-gradient-to-r from-white to-blue-300 text-[#1E3C98] hover:from-blue-100 hover:to-blue-400 transition-all duration-300 group shadow-lg hover:shadow-blue-500/20 hover:scale-105 font-bold"
                >
                  <Sparkles className="mr-2 h-5 w-5 group-hover:animate-pulse" />
                  Vedi Tutti gli Esperti
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        <section className="py-16 md:py-24 relative bg-gradient-to-br from-blue-950 via-slate-900 to-blue-950">
          <ConstellationBackground goldVisible={true} />
          <div className="container px-4 md:px-6 relative z-10">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl font-bold md:text-4xl text-white">Testimonianze di Anime Illuminate</h2>
              <p className="mt-4 text-lg text-slate-300 max-w-2xl mx-auto">
                Le esperienze spirituali autentiche dei nostri viaggiatori dell'anima.
              </p>
            </div>
            <Suspense fallback={<LoadingSpinner />}>
              <RecentReviews />
            </Suspense>
          </div>
        </section>

        <Suspense>
          <NewTalents />
        </Suspense>
      </main>
    </div>
  )
}
