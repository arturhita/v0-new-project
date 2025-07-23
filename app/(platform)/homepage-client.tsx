"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import OperatorCard from "@/components/operator-card"
import type { Operator } from "@/types/operator.types"
import { ReviewCard } from "@/components/review-card"
import type { Review } from "@/components/review-card"
import { ArticleCard } from "@/components/article-card"
import type { Article } from "@/types/article.types"

interface HomepageClientProps {
  featuredOperators: Operator[]
  recentArticles: Article[]
  reviews: Review[]
}

export default function HomepageClient({
  featuredOperators = [],
  recentArticles = [],
  reviews = [],
}: HomepageClientProps) {
  return (
    <div className="flex flex-col min-h-screen bg-slate-900 text-white overflow-x-hidden space-y-20 md:space-y-32">
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
      @keyframes fadeInLeft {
        from {
          opacity: 0;
          transform: translateX(-30px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      @keyframes fadeInRight {
        from {
          opacity: 0;
          transform: translateX(30px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
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
      @keyframes float {
        0%,
        100% {
          transform: translateY(0px);
        }
        50% {
          transform: translateY(-10px);
        }
      }
      .animate-fadeInUp {
        animation: fadeInUp 1s ease-out forwards;
      }
      .animate-fadeInLeft {
        animation: fadeInLeft 0.8s ease-out forwards;
      }
      .animate-fadeInRight {
        animation: fadeInRight 0.8s ease-out forwards;
      }
      .animate-scaleIn {
        animation: scaleIn 0.6s ease-out forwards;
      }
      .animate-float {
        animation: float 3s ease-in-out infinite;
      }
    `}</style>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="text-center pt-16 pb-20 md:pt-24 md:pb-28">
          <div className="max-w-4xl mx-auto px-4">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-500">
              La tua guida verso la chiarezza
            </h1>
            <p className="mt-6 text-lg md:text-xl max-w-2xl mx-auto text-slate-300">
              Connettiti istantaneamente con i migliori esperti di cartomanzia, astrologia e benessere. Trova le
              risposte che cerchi, quando ne hai più bisogno.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Button
                asChild
                size="lg"
                className="font-bold text-[#1E3C98] bg-yellow-400 hover:bg-yellow-300 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <Link href="/esperti/tutti">Scopri i nostri esperti</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="text-white border-white/80 hover:bg-white/10 font-semibold transition-colors duration-300 bg-transparent"
              >
                <Link href="/diventa-esperto">Diventa un esperto</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Featured Operators Section */}
        {featuredOperators && featuredOperators.length > 0 && (
          <section className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-white">Esperti in Evidenza</h2>
              <Button asChild variant="link" className="text-yellow-400 hover:text-yellow-300">
                <Link href="/esperti/tutti">
                  Vedi tutti <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {featuredOperators.map((operator) => (
                <OperatorCard key={operator.id} operator={operator} />
              ))}
            </div>
          </section>
        )}

        {/* Recent Articles Section */}
        {recentArticles && recentArticles.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 pb-20">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-white">Dal nostro Astromag</h2>
              <Button asChild variant="link" className="text-yellow-400 hover:text-yellow-300">
                <Link href="/astromag">
                  Leggi tutto <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recentArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </section>
        )}

        {/* Reviews Section */}
        <section className="py-16 md:py-24 bg-gradient-to-b from-slate-900 to-blue-950/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Cosa dicono di noi
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-slate-400">
                Le esperienze reali dei nostri utenti.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {reviews.map((review, index) => (
                <div key={review.id} className="animate-fadeInUp" style={{ animationDelay: `${index * 150}ms` }}>
                  <ReviewCard review={review} />
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
