"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { OperatorCard } from "@/components/operator-card"
import type { Operator } from "@/components/operator-card"
import { ReviewCard } from "@/components/review-card"
import type { Review } from "@/components/review-card"
import { ConstellationBackground } from "@/components/constellation-background"

interface HomepageClientProps {
  operators: Operator[]
  reviews: Review[]
  latestOperators: Operator[]
}

export function HomepageClient({ operators, reviews, latestOperators }: HomepageClientProps) {
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
        <section className="relative overflow-hidden pt-32 pb-20 md:pt-48 md:pb-32">
          <ConstellationBackground className="absolute top-0 left-0 h-full w-full text-sky-300/70" />
          <div className="container relative mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl animate-fadeInUp">
              Il viaggio inizia da qui
            </h1>
            <p
              className="mx-auto mt-6 max-w-2xl text-lg text-slate-300 md:text-xl animate-fadeInUp"
              style={{ animationDelay: "0.2s" }}
            >
              Connettiti con i migliori esperti di astrologia e tarocchi per una guida chiara e personalizzata.
            </p>
            <div className="mt-10 animate-fadeInUp" style={{ animationDelay: "0.4s" }}>
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-sky-500 to-amber-400 text-white font-bold text-lg px-8 py-6 transition-transform duration-300 hover:scale-105 shadow-lg shadow-sky-500/20"
              >
                <Link href="/esperti">Cerca Esperti</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Operatori in Evidenza Section */}
        <section className="py-16 md:py-24 relative bg-gradient-to-b from-slate-900 to-blue-950/30">
          <div className="container px-4 md:px-6 relative z-10">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl font-bold md:text-4xl text-white">Esperti in Evidenza</h2>
              <p className="mt-4 text-lg text-slate-300 max-w-2xl mx-auto">
                Trova la tua guida spirituale, disponibile ora per svelare i misteri del tuo destino.
              </p>
            </div>
            {operators.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                {operators.map((operator, index) => (
                  <div key={operator.id} className="animate-scaleIn" style={{ animationDelay: `${index * 100}ms` }}>
                    <OperatorCard operator={operator} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-slate-400">Nessun operatore disponibile al momento.</p>
              </div>
            )}
          </div>
        </section>

        {/* Ultimi Esperti Section */}
        {latestOperators && latestOperators.length > 0 && (
          <section className="py-16 md:py-24 bg-slate-950">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12 md:mb-16">
                <h2 className="text-3xl font-bold sm:text-4xl text-white">Ultimi Esperti Arrivati</h2>
                <p className="mt-4 text-lg text-slate-400">
                  Scopri i nuovi talenti che si sono uniti alla nostra community.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                {latestOperators.map((operator, index) => (
                  <div key={operator.id} className="animate-scaleIn" style={{ animationDelay: `${index * 100}ms` }}>
                    <OperatorCard operator={operator} showNewBadge={true} />
                  </div>
                ))}
              </div>
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
