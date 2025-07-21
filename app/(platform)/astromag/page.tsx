import Link from "next/link"
import Image from "next/image"
import { blogCategories, blogArticles } from "@/lib/blog-data"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { ArticleCard } from "@/components/article-card"
import { Badge } from "@/components/ui/badge"

export default function AstroMagHomePage() {
  const featuredArticle = blogArticles[3] // Pick one to feature
  const latestArticles = blogArticles.slice(0, 3)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white pt-16">
      <main className="pt-8">
        {/* Hero Section */}
        <section className="relative py-20 md:py-28">
          <div className="absolute inset-0 overflow-hidden">
            <Image
              src="/placeholder.svg?width=1920&height=600"
              alt="Sfondo cosmico"
              fill
              className="object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
          </div>
          <div className="container mx-auto px-4 relative z-10 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-sky-400 to-cyan-300 bg-clip-text text-transparent">
              AstroMag
            </h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto">
              La tua guida nel mondo della spiritualità, dei tarocchi e dell'astrologia. Esplora, impara e cresci con
              noi.
            </p>
          </div>
        </section>

        {/* Featured Article */}
        {featuredArticle && (
          <section className="py-16">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-slate-200 to-slate-400">
                In Evidenza
              </h2>
              <Link href={`/astromag/articolo/${featuredArticle.slug}`}>
                <div className="grid md:grid-cols-2 gap-8 items-center bg-slate-800/50 rounded-2xl p-8 border border-sky-500/20 hover:border-sky-500/40 transition-all duration-300">
                  <div className="relative h-80 rounded-lg overflow-hidden">
                    <Image
                      src={featuredArticle.imageUrl || "/placeholder.svg"}
                      alt={featuredArticle.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <Badge variant="outline" className="text-sky-300 border-sky-400/50 mb-4">
                      {blogCategories.find((c) => c.slug === featuredArticle.category)?.name}
                    </Badge>
                    <h3 className="text-3xl font-bold mb-4">{featuredArticle.title}</h3>
                    <p className="text-slate-400 mb-6">{featuredArticle.excerpt}</p>
                    <Button className="bg-gradient-to-r from-sky-500 to-cyan-500">
                      Leggi l'articolo <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Link>
            </div>
          </section>
        )}

        {/* Categories Section */}
        <section className="py-16 bg-slate-900/50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-slate-200 to-slate-400">
              Esplora le Categorie
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {blogCategories.map((category) => (
                <Link key={category.slug} href={`/astromag/${category.slug}`}>
                  <div className="group relative h-64 rounded-xl overflow-hidden text-white flex items-end p-6 text-center border-2 border-transparent hover:border-sky-400 transition-all duration-300">
                    <Image
                      src={category.imageUrl || "/placeholder.svg"}
                      alt={category.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                    <div className="relative z-10 w-full">
                      <span className="text-4xl mb-2">{category.icon}</span>
                      <h3 className="text-2xl font-bold">{category.name}</h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Latest Articles */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-slate-200 to-slate-400">
              Ultimi Articoli
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {latestArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
