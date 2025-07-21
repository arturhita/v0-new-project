import { getArticles, getCategories } from "@/lib/actions/blog.actions"
import { ArticleCard } from "@/components/article-card"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function AstromagPage() {
  const articles = await getArticles({ limit: 10, status: "published" })
  const categories = await getCategories()

  const featuredArticle = articles[0]
  const otherArticles = articles.slice(1)

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-800">AstroMag</h1>
        <p className="text-slate-600 mt-2">Le stelle, i tarocchi e la spiritualità come non li hai mai letti prima.</p>
      </header>

      <nav className="mb-12">
        <ul className="flex flex-wrap justify-center gap-2">
          {categories.map((category) => (
            <li key={category.id}>
              <Button asChild variant="outline">
                <Link href={`/astromag/${category.slug}`}>{category.name}</Link>
              </Button>
            </li>
          ))}
        </ul>
      </nav>

      {featuredArticle && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">In Evidenza</h2>
          <ArticleCard article={featuredArticle} />
        </section>
      )}

      <section>
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Ultimi Articoli</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {otherArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </section>
    </div>
  )
}
