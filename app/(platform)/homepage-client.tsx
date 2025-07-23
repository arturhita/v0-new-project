"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import OperatorCard, { type Operator } from "@/components/operator-card"
import ReviewCard, { type Review } from "@/components/review-card"
import { ConstellationBackground } from "@/components/constellation-background"
import { ArrowRight, CheckCircle, Users, Shield } from "lucide-react"

interface HomepageClientProps {
  operators: Operator[]
  reviews: Review[]
  latestOperators: Operator[]
}

export default function HomepageClient({ operators, reviews, latestOperators }: HomepageClientProps) {
  return (
    <div className="bg-slate-950 text-white">
      {/* Hero Section */}
      <section className="relative min-h-[70vh] md:min-h-screen flex items-center justify-center text-center overflow-hidden">
        <ConstellationBackground className="text-sky-400" goldVisible={true} />
        <Image
          src="/images/hero-background.png"
          alt="Mystical background"
          fill={true}
          objectFit="cover"
          className="absolute inset-0 z-0 opacity-20"
          priority
        />
        <div className="relative z-10 p-4">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-shadow-lg bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-300">
            Il viaggio inizia da qui
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-gray-300/80 text-shadow">
            Connettiti con i migliori esperti di astrologia e tarocchi. Trova le risposte che cerchi, quando ne hai più
            bisogno.
          </p>
          <div className="mt-8">
            <Button asChild size="lg" variant="gradient" className="text-lg px-8 py-6">
              <Link href="/esperti/tutti">
                Cerca Esperti <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Operators Section */}
      <section className="py-16 md:py-24 bg-slate-950/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-sky-300 to-blue-400">
            I nostri esperti in primo piano
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {operators.map((operator) => (
              <OperatorCard key={operator.id} operator={operator} />
            ))}
          </div>
          <div className="text-center mt-12">
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-sky-500 text-sky-400 hover:bg-sky-500/10 hover:text-white transition-all duration-300 bg-transparent"
            >
              <Link href="/esperti/tutti">
                Vedi tutti gli esperti <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 md:py-24 relative overflow-hidden bg-black/20">
        <ConstellationBackground className="text-sky-400/50" goldVisible={true} />
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-amber-300 to-yellow-400">
            Perché Scegliere Moonthir?
          </h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="bg-gray-950/50 p-8 rounded-xl border border-sky-500/20 transform hover:-translate-y-2 transition-transform duration-300">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-sky-900/50 rounded-full">
                  <CheckCircle className="h-8 w-8 text-sky-400" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Esperti Verificati</h3>
              <p className="text-gray-400">
                Selezioniamo solo i migliori professionisti per garantirti consulti di alta qualità.
              </p>
            </div>
            <div className="bg-gray-950/50 p-8 rounded-xl border border-sky-500/20 transform hover:-translate-y-2 transition-transform duration-300">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-sky-900/50 rounded-full">
                  <Shield className="h-8 w-8 text-sky-400" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Privacy Garantita</h3>
              <p className="text-gray-400">
                Le tue conversazioni sono protette e confidenziali. La tua privacy è la nostra priorità.
              </p>
            </div>
            <div className="bg-gray-950/50 p-8 rounded-xl border border-sky-500/20 transform hover:-translate-y-2 transition-transform duration-300">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-sky-900/50 rounded-full">
                  <Users className="h-8 w-8 text-sky-400" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Consulti Immediati</h3>
              <p className="text-gray-400">
                Connettiti con un esperto in pochi minuti, 24/7, tramite chat, chiamata o email.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Operators Section */}
      {latestOperators.length > 0 && (
        <section className="py-16 md:py-24 bg-slate-950/50 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-sky-300 to-blue-400">
              Nuovi talenti sulla piattaforma
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {latestOperators.map((operator) => (
                <OperatorCard key={operator.id} operator={operator} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials Section */}
      {reviews.length > 0 && (
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-amber-300 to-yellow-400">
              Cosa dicono di noi
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Become an Expert CTA */}
      <section className="relative py-16 md:py-24 text-center overflow-hidden">
        <ConstellationBackground className="text-sky-400" goldVisible={true} />
        <div className="relative z-10 container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-300">
            Sei un esperto di arti divinatorie?
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-300/80">
            Unisciti alla nostra community di professionisti e metti a frutto il tuo talento.
          </p>
          <div className="mt-8">
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-amber-400 text-amber-300 hover:bg-amber-400/10 hover:text-white transition-all duration-300 bg-transparent"
            >
              <Link href="/diventa-esperto">
                Diventa un Esperto <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
