import { blogArticles, blogCategories } from "@/lib/blog-data"
import ArticleCard from "@/components/article-card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import ConstellationBackground from "@/components/constellation-background"
import { notFound } from "next/navigation"

export default function CategoryPage({ params }: { params: { categoria: string } }) {
  const { categoria } = params
  const category = blogCategories.find((c) => c.slug === categoria)

  if (!category) {
    notFound()
  }

  const articles = blogArticles.filter((article) => article.category === categoria)

  return (
    <div className="bg-slate-900 text-white min-h-screen">
      <div className="relative py-20 md:py-28 text-center">
        <ConstellationBackground />
        <div className="relative z-10 container mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-amber-300 to-yellow-500">
            {category.name}
          </h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8 text-gray-300">{category.description}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center flex-wrap gap-2 mb-12">
          <Button asChild variant="ghost" className="hover:bg-sky-500/20 hover:text-white">
            <Link href="/astromag">Tutti</Link>
          </Button>
          {blogCategories.map((cat) => (
            <Button
              asChild
              key={cat.slug}
              variant={cat.slug === categoria ? "secondary" : "ghost"}
              className="hover:bg-sky-500/20 hover:text-white"
            >
              <Link href={`/astromag/${cat.slug}`}>{cat.name}</Link>
            </Button>
          ))}
        </div>

        {articles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-xl text-slate-400">Nessun articolo trovato in questa categoria.</p>
          </div>
        )}
      </div>
    </div>
  )
}
