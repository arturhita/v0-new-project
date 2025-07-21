import { getArticles, getCategoryBySlug } from "@/lib/actions/blog.actions"
import ArticleCard from "@/components/article-card"
import { notFound } from "next/navigation"

export default async function CategoriaPage({ params }: { params: { categoria: string } }) {
  const category = await getCategoryBySlug(params.categoria)
  if (!category) {
    notFound()
  }

  const articles = await getArticles({ categorySlug: params.categoria, status: "published" })

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-2 text-white">{category.name}</h1>
      <p className="text-lg text-center text-gray-300 mb-12">{category.description}</p>

      {articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-white text-2xl">Nessun articolo trovato in questa categoria.</p>
        </div>
      )}
    </div>
  )
}
