import { Suspense } from "react"
import HomepageClient from "./homepage-client"
import { getFeaturedOperators, getRecentArticles } from "@/lib/actions/data.actions"
import LoadingSpinner from "@/components/loading-spinner"
import type { Profile } from "@/lib/schemas"
import type { Article } from "@/lib/blog-data"

// Define a simple type for the fetched data to avoid any type errors
type Operator = Profile & { average_rating: number | null; review_count: number | null }
type FetchedArticle = Article

export default async function HomePage() {
  // Fetch data in parallel
  const operatorsData = getFeaturedOperators() as Promise<Operator[]>
  const articlesData = getRecentArticles() as Promise<FetchedArticle[]>

  const [operators, articles] = await Promise.all([operatorsData, articlesData])

  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-screen">
          <LoadingSpinner />
        </div>
      }
    >
      <HomepageClient operators={operators} articles={articles} />
    </Suspense>
  )
}
