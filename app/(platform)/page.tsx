import { getHomepageData, getLatestOperators } from "@/lib/actions/data.actions"
import HomepageClient from "./homepage-client"
import { Suspense } from "react"
import LoadingSpinner from "@/components/loading-spinner"

export const revalidate = 300 // Revalidate every 5 minutes

export default async function HomePage() {
  // Fetch data in parallel
  const homepageDataPromise = getHomepageData()
  const latestOperatorsPromise = getLatestOperators()

  const [homepageData, latestOperators] = await Promise.all([homepageDataPromise, latestOperatorsPromise])

  const { operators, reviews } = homepageData

  return (
    <Suspense fallback={<LoadingSpinner fullScreen />}>
      <HomepageClient operators={operators} reviews={reviews} latestOperators={latestOperators} />
    </Suspense>
  )
}
