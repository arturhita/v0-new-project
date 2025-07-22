"use client"

import Link from "next/link"
import { Search, ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { OperatorCard } from "@/components/operator-card"
import type { Operator } from "@/components/operator-card"
import { ReviewCard } from "@/components/review-card"
import type { Review } from "@/components/review-card"
import { ConstellationBackground } from "@/components/constellation-background"

interface HomepageClientProps {
  operators: Operator[]
  reviews: Review[]
}

export function HomepageClient({ operators = [], reviews = [] }: HomepageClientProps) {
  const newTalents = operators
    .filter((op) => op.joinedDate && new Date(op.joinedDate) > new Date(Date.now() - 10 * 24 * 60 * 60 * 1000))
    .sort((a, b) => new Date(b.joinedDate!).getTime() - new Date(a.joinedDate!).getTime())
    .slice(0, 3)

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
        @keyframes glow {
          0%,
          100% {
            box-shadow: 0 0 20px rgba(250, 204, 21, 0.4);
          }
          50% {
            box-shadow: 0 0 30px rgba(250, 204, 21, 0.6);
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
        .animate-glow {
          animation: glow 2s ease-in-out infinite;
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
                <Search className="mr-3 h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                Cerca Esperti
              </Button>
            </Link>
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
          <ConstellationBackground goldVisible={false} />
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
          <ConstellationBackground goldVisible={false} />
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
            <ConstellationBackground goldVisible={true} />
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
          <ConstellationBackground goldVisible={true} />
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
    </div>
  )
}
