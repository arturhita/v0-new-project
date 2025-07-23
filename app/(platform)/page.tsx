import { getHomepageData } from "@/lib/actions/data.actions"
import { HomepageClient } from "@/app/(platform)/homepage-client"
import type { Operator } from "@/types/operator.types"
import type { Article } from "@/types/article.types"

export const revalidate = 60 // Revalidate data every 60 seconds

export default async function HomePage() {
  // Fetch data for the homepage
  const { featuredOperators, recentArticles } = await getHomepageData()

  return (
    <HomepageClient featuredOperators={featuredOperators as Operator[]} recentArticles={recentArticles as Article[]} />
  )
}
