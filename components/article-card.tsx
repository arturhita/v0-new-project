import Link from "next/link"
import Image from "next/image"
import type { BlogArticle } from "@/types/blog.types"
import { ArrowRight } from "lucide-react"

export default function ArticleCard({ article }: { article: BlogArticle }) {
  return (
    <Link href={`/astromag/articolo/${article.slug}`}>
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg overflow-hidden shadow-lg h-full flex flex-col group transition-all duration-300 hover:shadow-indigo-500/30 hover:-translate-y-1">
        <div className="relative">
          <Image
            src={article.image_url || "/placeholder.svg?width=400&height=225"}
            alt={article.title}
            width={400}
            height={225}
            className="w-full h-48 object-cover"
          />
          {article.blog_categories?.name && (
            <span className="absolute top-3 right-3 bg-indigo-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
              {article.blog_categories.name}
            </span>
          )}
        </div>
        <div className="p-6 flex flex-col flex-grow">
          <h3 className="text-xl font-bold text-white mb-2">{article.title}</h3>
          <p className="text-gray-400 text-sm flex-grow">{article.excerpt}</p>
          <div className="mt-4 flex justify-between items-center text-indigo-400">
            <span className="font-semibold">Leggi di più</span>
            <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </Link>
  )
}
