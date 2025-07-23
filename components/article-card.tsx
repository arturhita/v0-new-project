import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { type BlogArticle, blogCategories } from "@/lib/blog-data"
import { Calendar, User } from "lucide-react"

// Modificato: da 'export default function' a 'export function' (esportazione nominativa)
export function ArticleCard({ article }: { article: BlogArticle }) {
  const category = blogCategories.find((c) => c.slug === article.category)

  return (
    <Link href={`/astromag/articolo/${article.slug}`}>
      <Card className="h-full flex flex-col bg-slate-800/50 border-sky-500/20 hover:border-sky-400/50 transition-all duration-300 overflow-hidden group">
        <CardHeader className="p-0">
          <div className="relative h-48">
            <Image
              src={article.imageUrl || "/placeholder.svg"}
              alt={article.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        </CardHeader>
        <CardContent className="p-6 flex-grow">
          {category && (
            <Badge variant="outline" className="text-sky-300 border-sky-400/50 mb-2">
              {category.name}
            </Badge>
          )}
          <CardTitle className="text-xl font-bold text-white mb-2 leading-tight">{article.title}</CardTitle>
          <p className="text-slate-400 text-sm">{article.excerpt}</p>
        </CardContent>
        <CardFooter className="p-6 pt-0 text-xs text-slate-500 flex justify-between">
          <div className="flex items-center">
            <User className="h-3 w-3 mr-1.5" />
            {article.author}
          </div>
          <div className="flex items-center">
            <Calendar className="h-3 w-3 mr-1.5" />
            {new Date(article.date).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" })}
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}
