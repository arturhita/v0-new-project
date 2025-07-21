import { getHomepageOperators, getHomepageReviews } from "@/lib/actions/data.actions"
import { HomepageClient } from "./homepage-client"

export default async function HomePage() {
  const [operators, reviews] = await Promise.all([getHomepageOperators(), getHomepageReviews()])

  return <HomepageClient operators={operators} reviews={reviews} />
}
