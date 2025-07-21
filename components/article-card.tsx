import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { ArrowRight } from "lucide-react"

// A type that includes the nested structures from our queries
type ArticleForCard = {
  id: string
  slug: string
  title: string
  excerpt: string | null
  image_url: string | null
  category: {
    name: string
    slug: string
  } | null
}

interface ArticleCardProps {
  article: ArticleForCard
}

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Link href={`/astromag/articolo/${article.slug}`}>
      <div className="bg-slate-800/50 rounded-2xl overflow-hidden h-full flex flex-col group border border-sky-500/10 hover:border-sky-500/40 transition-all duration-300">
        <div className="relative h-48">
          <Image
            src={article.image_url || "/placeholder.svg?width=400&height=250"}
            alt={article.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div className="p-6 flex flex-col flex-grow">
          {article.category && (
            <Badge variant="outline" className="text-sky-300 border-sky-400/50 mb-3 self-start">
              {article.category.name}
            </Badge>
          )}
          <h3 className="text-xl font-bold text-white mb-2 flex-grow">{article.title}</h3>
          <p className="text-slate-400 text-sm mb-4">{article.excerpt}</p>
          <div className="mt-auto text-sky-400 flex items-center font-semibold group-hover:text-sky-300">
            Leggi di più
            <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  )
}
