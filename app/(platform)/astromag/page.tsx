import { blogArticles, blogCategories } from "@/lib/blog-data"
import ArticleCard from "@/components/article-card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import ConstellationBackground from "@/components/constellation-background"

export default function AstroMagPage() {
  return (
    <div className="bg-slate-900 text-white min-h-screen">
      <div className="relative py-20 md:py-28 text-center">
        <ConstellationBackground />
        <div className="relative z-10 container mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-amber-300 to-yellow-500">
            AstroMag
          </h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8 text-gray-300">
            Approfondimenti, oroscopi e guide dal mondo dell'astrologia e della spiritualità.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center flex-wrap gap-2 mb-12">
          <Button asChild variant="ghost" className="hover:bg-sky-500/20 hover:text-white">
            <Link href="/astromag">Tutti</Link>
          </Button>
          {blogCategories.map((category) => (
            <Button asChild key={category.slug} variant="ghost" className="hover:bg-sky-500/20 hover:text-white">
              <Link href={`/astromag/${category.slug}`}>{category.name}</Link>
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogArticles.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      </div>
    </div>
  )
}
