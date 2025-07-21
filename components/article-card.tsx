import type { BlogArticle } from "@/types/blog.types"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock } from "lucide-react"

export function ArticleCard({ article }: { article: BlogArticle }) {
  return (
    <Link href={`/astromag/articolo/${article.slug}`} className="group block">
      <div className="overflow-hidden rounded-lg">
        <Image
          src={article.image_url || "/placeholder.svg?width=400&height=250"}
          alt={article.title}
          width={400}
          height={250}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="mt-4">
        {article.blog_categories && (
          <Badge variant="outline" className="mb-2">
            {article.blog_categories.name}
          </Badge>
        )}
        <h3 className="text-xl font-semibold text-slate-800 group-hover:text-sky-600 transition-colors">
          {article.title}
        </h3>
        <p className="text-slate-600 mt-2 text-sm">{article.excerpt}</p>
        <div className="flex items-center justify-between text-xs text-slate-500 mt-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-3 w-3" />
            <span>{article.published_at ? new Date(article.published_at).toLocaleDateString("it-IT") : "N/A"}</span>
          </div>
          {article.read_time_minutes && (
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3" />
              <span>{article.read_time_minutes} min di lettura</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
