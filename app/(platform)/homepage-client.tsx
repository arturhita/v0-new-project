"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Sparkles, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { OperatorCard } from "@/components/operator-card"
import type { Operator, Review } from "@/components/operator-card"
import { ReviewCard } from "@/components/review-card"
import { ConstellationBackground } from "@/components/constellation-background"
import { SiteNavbar } from "@/components/site-navbar"
import { SiteFooter } from "@/components/site-footer"

interface HomepageClientProps {
  operators: Operator[]
  reviews: Review[]
}

export function HomepageClient({ operators, reviews }: HomepageClientProps) {
  const newTalents = operators
    .filter((op) => op.joinedDate && new Date(op.joinedDate) > new Date(Date.now() - 10 * 24 * 60 * 60 * 1000))
    .sort((a, b) => new Date(b.joinedDate!).getTime() - new Date(a.joinedDate!).getTime())
    .slice(0, 3)

  return (
    <div className="flex min-h-screen flex-col bg-slate-900 text-white">
      <ConstellationBackground />
      <SiteNavbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 text-center">
          <div className="container z-10 mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight text-balance bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
              Esplora i Misteri dell'Universo con Moonthir
            </h1>
            <p className="mt-4 text-lg md:text-xl max-w-3xl mx-auto text-gray-300 text-balance">
              Connettiti con i migliori esperti di astrologia, tarocchi e numerologia. La tua guida per il futuro è a un
              solo click di distanza.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Button
                asChild
                size="lg"
                className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-full shadow-lg shadow-indigo-500/30 transition-transform transform hover:scale-105"
              >
                <Link href="/esperti">Trova il tuo Esperto</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-indigo-400 text-indigo-300 hover:bg-indigo-500/10 hover:text-white rounded-full transition-colors bg-transparent"
              >
                <Link href="/diventa-esperto">Diventa un Esperto</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Operatori in Evidenza */}
        <section id="esperti" className="py-16 bg-slate-900/50 backdrop-blur-sm">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-amber-400">I Nostri Esperti in Evidenza</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {operators.slice(0, 4).map((operator) => (
                <Card
                  key={operator.id}
                  className="bg-slate-800/60 border-slate-700 text-center overflow-hidden transform hover:-translate-y-2 transition-transform duration-300"
                >
                  <CardContent className="p-6">
                    <Image
                      src={operator.avatar_url || "/placeholder.svg?width=128&height=128&query=avatar"}
                      alt={operator.full_name || "Operatore"}
                      width={128}
                      height={128}
                      className="rounded-full mx-auto mb-4 border-4 border-indigo-500"
                    />
                    <h3 className="text-xl font-semibold text-white">{operator.full_name}</h3>
                    <p className="text-indigo-300 mb-2">{operator.specialties?.join(", ")}</p>
                    <div className="flex justify-center items-center gap-1 text-amber-400 mb-4">
                      <Star className="w-5 h-5 fill-current" />
                      <span>
                        {operator.average_rating?.toFixed(1) || "N/A"} ({operator.review_count || 0} recensioni)
                      </span>
                    </div>
                    <Button asChild className="btn-gradient rounded-full">
                      <Link href={`/operator/${operator.username}`}>Vedi Profilo</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center mt-12">
              <Button
                asChild
                size="lg"
                variant="ghost"
                className="text-amber-400 hover:text-white hover:bg-amber-400/10"
              >
                <Link href="/esperti">Vedi tutti gli Esperti →</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Operator Boxes Section */}
        <section className="py-16 md:py-24 relative bg-gradient-to-br from-blue-950 via-slate-900 to-blue-950 overflow-hidden">
          <div className="container px-4 md:px-6 relative z-10">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl font-bold md:text-4xl text-white">Esperti pronti ad illuminarti</h2>
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

        {/* Quote Section */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="bg-gradient-to-r from-blue-900/50 to-slate-800/50 rounded-2xl shadow-xl p-8 md:p-12">
              <blockquote className="text-center">
                <p className="text-2xl md:text-3xl italic text-white font-playfair">
                  "L'intuizione è la voce dell'anima. Impara ad ascoltarla."
                </p>
              </blockquote>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-16 md:py-24 relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
          <div className="container px-4 md:px-6 relative z-10">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl font-bold md:text-4xl text-white">Servizi Spirituali Disponibili</h2>
              <p className="mt-4 text-lg text-slate-300 max-w-2xl mx-auto">
                Esplora i diversi cammini verso l'illuminazione attraverso le nostre discipline mistiche.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              {[
                { title: "Cartomanzia", description: "Letture di tarocchi e carte per svelare il futuro", icon: "🔮" },
                {
                  title: "Numerologia",
                  description: "Scopri i segreti nascosti nei numeri del tuo destino",
                  icon: "🔢",
                },
                {
                  title: "Astrologia",
                  description: "Carte natali e interpretazioni astrali personalizzate",
                  icon: "⭐",
                },
                { title: "Canalizzazione", description: "Connessioni spirituali con energie superiori", icon: "✨" },
                {
                  title: "Guarigione Energetica",
                  description: "Riequilibrio dei chakra e armonizzazione energetica",
                  icon: "🌟",
                },
                { title: "Rune", description: "Antiche divinazioni attraverso simboli runici", icon: "🪬" },
                { title: "Cristalloterapia", description: "Poteri curativi e energetici dei cristalli", icon: "💎" },
                { title: "Medianità", description: "Comunicazione con il mondo spirituale", icon: "👻" },
              ].map((service, index) => (
                <div
                  key={service.title}
                  className="group relative overflow-hidden bg-gradient-to-br from-blue-900/50 via-slate-800/50 to-blue-900/50 backdrop-blur-md rounded-2xl shadow-lg hover:shadow-yellow-400/10 transition-all duration-500 transform hover:-translate-y-2 cursor-pointer animate-scaleIn border border-blue-700/50"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="relative p-8 text-center h-full flex flex-col items-center">
                    <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-500 animate-float">
                      {service.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-4 text-white">{service.title}</h3>
                    <p className="text-slate-300 text-sm leading-relaxed flex-1">{service.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Recensioni */}
        <section className="py-16">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-amber-400">Cosa Dicono i Nostri Clienti</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {reviews.slice(0, 3).map((review) => (
                <Card key={review.id} className="bg-slate-800/60 border-slate-700">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <Image
                        src={review.client_avatar_url || "/placeholder.svg?width=48&height=48&query=client"}
                        alt={review.client_name || "Cliente"}
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                      <div>
                        <CardTitle className="text-lg text-white">{review.client_name}</CardTitle>
                        <p className="text-sm text-slate-400">Per {review.operator_name}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${i < review.rating ? "text-amber-400 fill-current" : "text-slate-600"}`}
                        />
                      ))}
                    </div>
                    <p className="text-slate-300 italic">"{review.comment}"</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        <section className="py-16 md:py-24 relative bg-gradient-to-br from-blue-950 via-slate-900 to-blue-950">
          <div className="container px-4 md:px-6 relative z-10">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl font-bold md:text-4xl text-white">Testimonianze di Anime Illuminate</h2>
              <p className="mt-4 text-lg text-slate-300 max-w-2xl mx-auto">
                Le esperienze spirituali autentiche dei nostri viaggiatori dell'anima.
              </p>
            </div>
            {reviews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                {reviews.map((review, index) => (
                  <div key={review.id} className="animate-scaleIn" style={{ animationDelay: `${index * 100}ms` }}>
                    <ReviewCard review={review} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-slate-400">Nessuna testimonianza recente.</div>
            )}
          </div>
        </section>

        {/* Why Trust Us Section */}
        <section className="py-16 md:py-24 relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
          <div className="container px-4 md:px-6 relative z-10">
            <div className="text-center mb-16 md:mb-20">
              <h2 className="text-3xl font-bold md:text-4xl lg:text-5xl text-white mb-6">La Magia di Moonthir</h2>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
                Scopri perché migliaia di anime si affidano alla nostra guida spirituale per illuminare il loro cammino
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div className="space-y-8 animate-fadeInLeft">
                {[
                  {
                    number: "01",
                    title: "Esperti Certificati",
                    description:
                      "I nostri maestri spirituali sono selezionati attraverso rigorosi test di competenza e sensibilità. Ogni consulente porta anni di esperienza e una connessione autentica con le energie universali.",
                    icon: "✨",
                  },
                  {
                    number: "02",
                    title: "Disponibilità 24/7",
                    description:
                      "L'universo non dorme mai, e nemmeno noi. I nostri esperti sono disponibili in ogni momento per guidarti attraverso le sfide della vita, quando ne hai più bisogno.",
                    icon: "🌙",
                  },
                  {
                    number: "03",
                    title: "Letture Personalizzate",
                    description:
                      "Ogni consulenza è unica come la tua anima. Utilizziamo tecniche antiche e moderne per offrirti insight profondi e consigli su misura per il tuo percorso spirituale.",
                    icon: "🔮",
                  },
                ].map((item) => (
                  <div key={item.title} className="group flex items-start space-x-6">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-800 to-slate-800 flex items-center justify-center text-xl font-bold text-yellow-400 shadow-lg group-hover:scale-110 transition-transform duration-300 border-2 border-blue-700">
                        {item.number}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">
                        {item.icon} {item.title}
                      </h3>
                      <p className="text-slate-300 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="relative animate-fadeInRight">
                <div className="relative bg-gradient-to-br from-blue-900/50 to-slate-800/50 backdrop-blur-md rounded-2xl p-8 border border-blue-700/50 shadow-2xl">
                  <div className="text-center space-y-8">
                    <div>
                      <div className="text-7xl font-black text-white">98%</div>
                      <p className="text-xl text-slate-300">Clienti Soddisfatti</p>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="text-center p-4 rounded-xl bg-slate-800/50 border border-blue-800">
                        <div className="text-4xl font-black text-white mb-2">15K+</div>
                        <p className="text-sm text-slate-400">Consulenze</p>
                      </div>
                      <div className="text-center p-4 rounded-xl bg-slate-800/50 border border-blue-800">
                        <div className="text-4xl font-black text-white mb-2">24/7</div>
                        <p className="text-sm text-slate-400">Supporto</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* New Talents Section */}
        {newTalents.length > 0 && (
          <section className="py-16 md:py-24 relative bg-gradient-to-br from-blue-950 via-slate-900 to-blue-950">
            <div className="container px-4 md:px-6 relative z-10">
              <div className="text-center mb-12 md:mb-16">
                <h2 className="text-3xl font-bold md:text-4xl text-white">Nuovi talenti Moonthir</h2>
                <p className="mt-4 text-lg text-slate-300 max-w-2xl mx-auto">
                  Scopri i maestri spirituali che si sono uniti di recente alla nostra comunità mistica.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {newTalents.map((operator, index) => (
                  <div key={operator.id} className="animate-scaleIn" style={{ animationDelay: `${index * 100}ms` }}>
                    <OperatorCard operator={operator} showNewBadge={true} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Ready to Reveal Section */}
        <section className="py-20 md:py-32 relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
          <div className="container px-4 md:px-6 relative z-10">
            <div className="text-center max-w-3xl mx-auto">
              <div className="mb-8 animate-float">
                <div className="text-6xl md:text-8xl">🌙</div>
              </div>
              <h2 className="text-4xl font-bold md:text-5xl text-white mb-6">
                Pronto a Svelare i Misteri del Tuo Destino?
              </h2>
              <p className="text-xl text-slate-300 mb-12">
                L'universo ha preparato per te un cammino unico. I nostri maestri sono qui per illuminare ogni passo del
                tuo viaggio.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-yellow-500 text-white text-lg px-8 py-4 rounded-full hover:from-blue-600 hover:to-yellow-600 transition-all duration-500 shadow-lg hover:shadow-xl hover:scale-105 font-semibold group"
                >
                  <Link href="/esperti/cartomanzia">
                    Inizia la Tua Prima Lettura
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="text-white border-2 border-yellow-400/60 bg-white/10 backdrop-blur-md hover:bg-white/20 hover:border-yellow-400 text-lg px-8 py-4 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 font-semibold group"
                >
                  <Link href="/esperti/cartomanzia">Esplora i Nostri Esperti</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
