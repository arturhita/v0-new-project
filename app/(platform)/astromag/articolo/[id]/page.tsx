import { blogArticles, blogCategories } from "@/lib/blog-data"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Calendar, User } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export default function ArticlePage({ params }: { params: { id: string } }) {
  const article = blogArticles.find((a) => a.slug === params.id)

  if (!article) {
    notFound()
  }

  const category = blogCategories.find((c) => c.slug === article.category)

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
              {category && (
                <>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link href={`/astromag/${category.slug}`} className="text-sky-300 hover:text-sky-200">
                        {category.name}
                      </Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                </>
              )}
              <BreadcrumbItem>
                <BreadcrumbPage className="text-white font-medium truncate max-w-xs md:max-w-md">
                  {article.title}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <article className="max-w-4xl mx-auto">
            <header className="mb-8">
              {category && (
                <Badge variant="outline" className="text-sky-300 border-sky-400/50 mb-4">
                  {category.name}
                </Badge>
              )}
              <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-4">{article.title}</h1>
              <div className="flex items-center space-x-4 text-sm text-slate-400">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  <span>{article.author}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>
                    {new Date(article.date).toLocaleDateString("it-IT", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </header>

            <div className="relative h-64 md:h-96 mb-8 rounded-lg overflow-hidden">
              <Image src={article.imageUrl || "/placeholder.svg"} alt={article.title} fill className="object-cover" />
            </div>

            <div
              className="prose prose-invert prose-lg max-w-none text-slate-300 prose-headings:text-white prose-a:text-sky-400 hover:prose-a:text-sky-300 prose-strong:text-slate-200"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </article>
        </div>
      </main>
    </div>
  )
}
