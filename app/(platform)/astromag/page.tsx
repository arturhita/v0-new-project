import { getArticles, getCategories } from "@/lib/actions/blog.actions"
import { ArticleCard } from "@/components/article-card"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export default async function AstromagPage() {
  const articles = await getArticles({ status: "published" })
  const categories = await getCategories()

  const featuredArticle = articles[0]
  const otherArticles = articles.slice(1)

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-slate-800">AstroMag</h1>
        <p className="text-lg text-slate-600 mt-2">
          Approfondimenti, guide e curiosità dal mondo dell'astrologia e della spiritualità.
        </p>
      </header>

      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-slate-700 mb-4">Categorie</h2>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Link href={`/astromag/${category.slug}`} key={category.id}>
              <Badge variant="secondary" className="text-sm px-3 py-1 hover:bg-slate-300 transition-colors">
                {category.name}
              </Badge>
            </Link>
          ))}
        </div>
      </div>

      {featuredArticle && (
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-slate-700 mb-4">In Evidenza</h2>
          <ArticleCard article={featuredArticle} />
        </div>
      )}

      <div>
        <h2 className="text-2xl font-semibold text-slate-700 mb-4">Ultimi Articoli</h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {otherArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </div>
    </div>
  )
}
