import { getArticleBySlug } from "@/lib/actions/blog.actions"
import { notFound } from "next/navigation"
import Image from "next/image"
import { Calendar, Clock, User } from "lucide-react"

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const article = await getArticleBySlug(params.slug)

  if (!article) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <article className="bg-gray-900/50 backdrop-blur-sm text-white rounded-lg shadow-xl overflow-hidden p-6 md:p-10">
        <header className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">{article.title}</h1>
          <p className="text-xl text-gray-300">{article.excerpt}</p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-6 text-gray-400 text-sm">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{article.profiles?.full_name || "Team"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <time dateTime={article.published_at || article.created_at}>
                {new Date(article.published_at || article.created_at).toLocaleDateString("it-IT", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
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
              width={1200}
              height={600}
              className="w-full object-cover"
            />
          </div>
        )}

        <div
          className="prose prose-invert prose-lg max-w-none prose-p:text-gray-300 prose-headings:text-white prose-a:text-indigo-400 hover:prose-a:text-indigo-300 prose-strong:text-white"
          dangerouslySetInnerHTML={{ __html: article.content || "" }}
        />
      </article>
    </div>
  )
}
