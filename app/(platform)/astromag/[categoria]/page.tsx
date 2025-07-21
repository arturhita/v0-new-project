import { getArticles, getCategoryBySlug } from "@/lib/actions/blog.actions"
import { ArticleCard } from "@/components/article-card"
import { notFound } from "next/navigation"

export default async function CategoryPage({ params }: { params: { categoria: string } }) {
  const category = await getCategoryBySlug(params.categoria)
  if (!category) {
    notFound()
  }

  const articles = await getArticles({ categorySlug: params.categoria, status: "published" })

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-12">
        <h1 className="text-4xl font-bold text-slate-800">{category.name}</h1>
        <p className="text-lg text-slate-600 mt-2">{category.description}</p>
      </header>

      {articles.length > 0 ? (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-slate-500">Nessun articolo trovato in questa categoria.</p>
        </div>
      )}
    </div>
  )
}
