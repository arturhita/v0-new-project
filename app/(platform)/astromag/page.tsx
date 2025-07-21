import { getArticles } from "@/lib/actions/blog.actions"
import ArticleCard from "@/components/article-card"
import Link from "next/link"

export default async function AstromagPage() {
  const articles = await getArticles({ limit: 10, status: "published" })
  const featuredArticle = articles[0]
  const otherArticles = articles.slice(1)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-4 text-white">Astromag</h1>
      <p className="text-xl text-center text-gray-300 mb-12">
        Il tuo portale sulle stelle. Approfondimenti, oroscopi e curiosità dal mondo dell'astrologia e della
        cartomanzia.
      </p>

      {featuredArticle && (
        <div className="mb-12">
          <Link href={`/astromag/articolo/${featuredArticle.slug}`}>
            <div className="relative rounded-lg overflow-hidden shadow-2xl group cursor-pointer">
              <img
                src={featuredArticle.image_url || "/placeholder.svg?width=1200&height=600"}
                alt={featuredArticle.title}
                className="w-full h-96 object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-0 left-0 p-8 text-white">
                <span className="text-sm font-semibold bg-indigo-500 px-3 py-1 rounded-full">
                  {featuredArticle.blog_categories?.name}
                </span>
                <h2 className="text-4xl font-bold mt-2">{featuredArticle.title}</h2>
                <p className="mt-2 text-lg opacity-90">{featuredArticle.excerpt}</p>
              </div>
            </div>
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {otherArticles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  )
}
