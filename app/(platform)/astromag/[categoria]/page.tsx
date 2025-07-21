import { getPublicArticles, getPublicCategories } from "@/lib/actions/blog.actions"
import { ArticleCard } from "@/components/article-card"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export default async function AstroMagCategoryPage({ params }: { params: { categoria: string } }) {
  const { categoria } = params
  const categories = await getPublicCategories()
  const category = categories.find((c) => c.slug === categoria)

  if (!category) {
    notFound()
  }

  const articlesInCategory = await getPublicArticles({ categorySlug: categoria })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white pt-16">
      <main className="pt-8">
        <div className="container mx-auto px-4 py-12">
          <Breadcrumb className="mb-8">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/astromag" className="text-sky-300 hover:text-sky-200">
                    AstroMag
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-white font-medium">{category.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{category.name}</h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">{category.description}</p>
          </div>

          {articlesInCategory.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articlesInCategory.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-slate-800/50 rounded-lg">
              <p className="text-slate-400 text-lg">Nessun articolo trovato in questa categoria al momento.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
