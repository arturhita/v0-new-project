"use client"

import { getApprovedOperators } from "@/lib/actions/operator.actions"
import { OperatorCard } from "@/components/operator-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ReviewCard, type Review as ReviewCardType } from "@/components/review-card"
import { ArrowRight, Star, Layers, Heart, Briefcase, BookOpen, Pentagon } from "lucide-react"

// Dati di prova per le recensioni, verranno sostituiti in seguito
const allMockReviews: ReviewCardType[] = [
  {
    id: "r1",
    userName: "Giulia R.",
    userType: "Vip",
    operatorName: "Luna Stellare",
    rating: 5,
    comment: "Luna è incredibile! Le sue letture sono sempre accurate e piene di speranza. Mi ha aiutato tantissimo.",
    date: new Date(Date.now() - 49 * 60 * 1000).toISOString(),
  },
  {
    id: "r2",
    userName: "Marco B.",
    userType: "Utente",
    operatorName: "Maestro Cosmos",
    rating: 5,
    comment: "Un vero professionista. L'analisi del mio tema natale è stata illuminante. Consigliatissimo!",
    date: new Date(Date.now() - 57 * 60 * 1000).toISOString(),
  },
  {
    id: "r3",
    userName: "Sofia L.",
    userType: "Vip",
    operatorName: "Sage Aurora",
    rating: 4,
    comment:
      "Aurora è molto dolce e intuitiva. Le sue previsioni con le Sibille sono state utili e mi hanno dato conforto.",
    date: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
]

export default async function UnveillyHomePage() {
  const operators = await getApprovedOperators()

  const categories = [
    { name: "Tarocchi", href: "/esperti/tarocchi", icon: Layers },
    { name: "Astrologia", href: "/esperti/astrologia", icon: Star },
    { name: "Amore", href: "/esperti/amore", icon: Heart },
    { name: "Lavoro", href: "/esperti/lavoro", icon: Briefcase },
    { name: "Sibille", href: "/esperti/sibille", icon: BookOpen },
    { name: "Rune", href: "/esperti/rune", icon: Pentagon },
  ]

  const newTalents = operators
    .filter((op) => op.joinedDate && new Date(op.joinedDate) > new Date(Date.now() - 10 * 24 * 60 * 60 * 1000))
    .sort((a, b) => new Date(b.joinedDate!).getTime() - new Date(a.joinedDate!).getTime())
    .slice(0, 3)

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#0F001F] to-[#030014] text-white">
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative text-center py-20 md:py-32 lg:py-40 px-4 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center z-0"
            style={{ backgroundImage: "url('/images/hero-background.png')" }}
          >
            <div className="absolute inset-0 bg-black/60"></div>
          </div>
          <div className="relative z-10">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-shadow-lg">
              Scopri cosa ti riserva il futuro.
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-gray-300 text-shadow">
              I nostri esperti sono qui per guidarti. Un consulto può cambiarti la vita.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Button
                asChild
                size="lg"
                className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-8 py-3 transition-transform transform hover:scale-105"
              >
                <Link href="/esperti/tutti">Trova il tuo esperto</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-purple-400 text-purple-300 hover:bg-purple-900/50 hover:text-white rounded-full px-8 py-3 transition-transform transform hover:scale-105 bg-transparent"
              >
                <Link href="/diventa-esperto">Diventa un esperto</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Quote Section */}
        <section className="bg-[#1a0d2b] py-12">
          <div className="container mx-auto px-4 text-center">
            <blockquote className="max-w-3xl mx-auto">
              <p className="text-2xl italic text-gray-300">
                "Non siamo esseri umani che vivono un'esperienza spirituale. Siamo esseri spirituali che vivono
                un'esperienza umana."
              </p>
              <footer className="mt-4 text-lg text-purple-400 font-semibold">- Pierre Teilhard de Chardin</footer>
            </blockquote>
          </div>
        </section>

        {/* Operators Section */}
        <section className="py-16 md:py-24 bg-[#0F001F]">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">I nostri migliori esperti</h2>
              <p className="mt-2 text-lg text-gray-400">Selezionati per te, disponibili ora.</p>
            </div>
            {operators.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                {operators.slice(0, 8).map((operator) => (
                  <OperatorCard key={operator.id} operator={operator} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-gray-500">
                <p className="text-xl">Al momento non ci sono operatori disponibili.</p>
                <p>Torna a trovarci presto!</p>
              </div>
            )}
            <div className="text-center mt-12">
              <Button
                asChild
                size="lg"
                className="bg-transparent border-2 border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white rounded-full px-10 py-3 transition-all duration-300"
              >
                <Link href="/esperti/tutti">Vedi tutti gli esperti</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16 md:py-24 bg-gradient-to-b from-[#030014] to-[#0F001F]">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">Esplora le categorie</h2>
              <p className="mt-2 text-lg text-gray-400">Trova il consulto perfetto per le tue esigenze.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
              {categories.map((category) => (
                <Link key={category.name} href={category.href}>
                  <div className="group block text-center p-6 bg-purple-900/20 rounded-lg border border-purple-800/50 hover:bg-purple-900/40 hover:border-purple-600 transition-all duration-300 transform hover:-translate-y-1">
                    {/* You can use Lucide icons here if you have them set up */}
                    <category.icon className="text-4xl text-purple-400 group-hover:text-purple-300 mb-2 mx-auto" />
                    <h3 className="font-semibold text-lg text-white">{category.name}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Why Trust Us Section */}
        <section className="py-16 md:py-24 relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16 md:mb-20">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">La Magia di Moonthir</h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                Scopri perché migliaia di anime si affidano alla nostra guida spirituale per illuminare il loro cammino
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div className="space-y-8">
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
                      <p className="text-gray-400 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="relative">
                <div className="relative bg-gradient-to-br from-blue-900/50 to-slate-800/50 backdrop-blur-md rounded-2xl p-8 border border-blue-700/50 shadow-2xl">
                  <div className="text-center space-y-8">
                    <div>
                      <div className="text-7xl font-black text-white">98%</div>
                      <p className="text-xl text-gray-400">Clienti Soddisfatti</p>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="text-center p-4 rounded-xl bg-slate-800/50 border border-blue-800">
                        <div className="text-4xl font-black text-white mb-2">15K+</div>
                        <p className="text-sm text-gray-400">Consulenze</p>
                      </div>
                      <div className="text-center p-4 rounded-xl bg-slate-800/50 border border-blue-800">
                        <div className="text-4xl font-black text-white mb-2">24/7</div>
                        <p className="text-sm text-gray-400">Supporto</p>
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
          <section className="py-16 md:py-24 bg-gradient-to-br from-blue-950 via-slate-900 to-blue-950">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold">Nuovi talenti Moonthir</h2>
                <p className="mt-2 text-lg text-gray-400">
                  Scopri i maestri spirituali che si sono uniti di recente alla nostra comunità mistica.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {newTalents.map((operator) => (
                  <OperatorCard key={operator.id} operator={operator} showNewBadge={true} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Reviews Section */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-blue-950 via-slate-900 to-blue-950">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">Testimonianze di Anime Illuminate</h2>
              <p className="mt-2 text-lg text-gray-400">
                Le esperienze spirituali autentiche dei nostri viaggiatori dell'anima.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {allMockReviews.map((review) => (
                <div key={review.id}>
                  <ReviewCard review={review} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Ready to Reveal Section */}
        <section className="py-20 md:py-32 relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto">
              <div className="mb-8">
                <div className="text-6xl md:text-8xl">🌙</div>
              </div>
              <h2 className="text-4xl font-bold md:text-5xl mb-6">Pronto a Svelare i Misteri del Tuo Destino?</h2>
              <p className="text-xl text-gray-400 mb-12">
                L'universo ha preparato per te un cammino unico. I nostri maestri sono qui per illuminare ogni passo del
                tuo viaggio.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-yellow-500 text-white text-lg px-8 py-4 rounded-full hover:from-blue-600 hover:to-yellow-600 transition-transform transform hover:scale-105 font-semibold group"
                >
                  <Link href="/esperti/cartomanzia">
                    Inizia la Tua Prima Lettura
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
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
