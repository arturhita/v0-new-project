import type { BlogArticle } from "@/types/blog.types"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "./ui/badge"
import { Calendar, Clock } from "lucide-react"

export function ArticleCard({ article }: { article: BlogArticle }) {
  return (
    <Link href={`/astromag/articolo/${article.slug}`} className="group block">
      <div className="flex flex-col h-full bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
        {article.image_url && (
          <div className="relative h-48 w-full">
            <Image src={article.image_url || "/placeholder.svg"} alt={article.title} fill className="object-cover" />
          </div>
        )}
        <div className="p-6 flex flex-col flex-grow">
          {article.blog_categories && (
            <Badge variant="outline" className="mb-2 self-start">
              {article.blog_categories.name}
            </Badge>
          )}
          <h3 className="text-xl font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors duration-300">
            {article.title}
          </h3>
          <p className="text-slate-600 mt-2 text-sm flex-grow">{article.excerpt}</p>
          <div className="flex items-center justify-between text-xs text-slate-500 mt-4">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{article.published_at ? new Date(article.published_at).toLocaleDateString("it-IT") : "Bozza"}</span>
            </div>
            {article.read_time_minutes && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{article.read_time_minutes} min lettura</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
