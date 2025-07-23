"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import OperatorCard from "@/components/operator-card"
import ArticleCard from "@/components/article-card"
import ConstellationBackground from "@/components/constellation-background"
import { ArrowRight } from "lucide-react"
import type { Operator } from "@/components/operator-card"
import type { BlogArticle as Article } from "@/lib/blog-data"

interface HomepageClientProps {
  operators: Operator[]
  reviews: any[] // Assuming reviews can be of any structure for now
  latestOperators: Operator[]
  articles?: Article[] // Make articles optional to avoid breaking if not passed
}

export default function HomepageClient({ operators, reviews, latestOperators, articles = [] }: HomepageClientProps) {
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
        <section
          className="relative flex h-[60vh] min-h-[500px] w-full flex-col items-center justify-center bg-cover bg-center bg-no-repeat px-4 text-center"
          style={{ backgroundImage: "url('/images/hero-background.png')" }}
        >
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative z-10 animate-fadeInUp">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
              Il viaggio inizia da qui
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300 md:text-xl">
              Connettiti con i migliori esperti di astrologia e tarocchi per una guida chiara e personalizzata.
            </p>
            <div className="mt-10">
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

        {/* Featured Operators */}
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
          </div>
        </section>

        {/* Last Operators */}
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

        {/* AstroMag Section */}
        {articles.length > 0 && (
          <section className="py-16 bg-slate-900/50">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold text-center mb-10 text-amber-400">Dal Nostro AstroMag</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {articles.map((article) => (
                  <ArticleCard key={article.slug} article={article} />
                ))}
              </div>
              <div className="text-center mt-12">
                <Button
                  asChild
                  variant="outline"
                  className="border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-slate-900 bg-transparent"
                >
                  <Link href="/astromag">
                    Leggi tutti gli articoli <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
