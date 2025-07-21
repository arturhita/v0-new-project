import { getArticleBySlug } from "@/lib/actions/blog.actions"
import Image from "next/image"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, User } from "lucide-react"

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const article = await getArticleBySlug(params.slug)

  if (!article) {
    notFound()
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <article>
        <header className="mb-8">
          {article.blog_categories && (
            <Badge variant="outline" className="mb-2">
              {article.blog_categories.name}
            </Badge>
          )}
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 leading-tight">{article.title}</h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500 mt-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{article.profiles?.full_name || "Redazione"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{article.published_at ? new Date(article.published_at).toLocaleDateString("it-IT") : "N/A"}</span>
            </div>
            {article.read_time_minutes && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{article.read_time_minutes} min di lettura</span>
              </div>
            )}
          </div>
        </header>

        {article.image_url && (
          <div className="mb-8 rounded-lg overflow-hidden">
            <Image
              src={article.image_url || "/placeholder.svg"}
              alt={article.title}
              width={800}
              height={450}
              className="w-full object-cover"
              priority
            />
          </div>
        )}

        <div
          className="prose prose-slate max-w-none lg:prose-lg"
          dangerouslySetInnerHTML={{ __html: article.content || "" }}
        />
      </article>
    </div>
  )
}
