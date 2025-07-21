import Link from "next/link"
import Image from "next/image"
import type { BlogArticle } from "@/types/blog.types"
import { Badge } from "@/components/ui/badge"
import { ArrowRight } from "lucide-react"

export function ArticleCard({ article }: { article: BlogArticle }) {
  return (
    <Link href={`/astromag/articolo/${article.slug}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden group h-full flex flex-col">
        <div className="relative h-48 w-full">
          <Image
            src={article.image_url || "/placeholder.svg?width=400&height=250"}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="p-4 flex flex-col flex-grow">
          {article.blog_categories && (
            <Badge variant="secondary" className="mb-2 self-start">
              {article.blog_categories.name}
            </Badge>
          )}
          <h3 className="text-lg font-bold text-slate-800 flex-grow">{article.title}</h3>
          <p className="text-sm text-slate-600 mt-2 line-clamp-3">{article.excerpt}</p>
          <div className="mt-4 flex justify-between items-center text-sm text-slate-500">
            <span>{article.published_at ? new Date(article.published_at).toLocaleDateString("it-IT") : "Bozza"}</span>
            <span className="flex items-center font-semibold text-sky-600">
              Leggi
              <ArrowRight className="ml-1 h-4 w-4" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
