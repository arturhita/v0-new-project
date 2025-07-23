import { getHomepageData, getLatestOperators } from "@/lib/actions/data.actions"
import HomepageClient from "./homepage-client"
import { Suspense } from "react"
import LoadingSpinner from "@/components/loading-spinner"

export const revalidate = 300 // Revalidate every 5 minutes

export default async function HomePage() {
  try {
    // Fetch data in parallel
    const homepageDataPromise = getHomepageData()
    const latestOperatorsPromise = getLatestOperators()

    const [homepageData, latestOperators] = await Promise.all([homepageDataPromise, latestOperatorsPromise])

    // Destructure all properties from homepageData
    const { operators, reviews, articles } = homepageData

    return (
      <Suspense fallback={<LoadingSpinner fullScreen />}>
        <HomepageClient operators={operators} reviews={reviews} articles={articles} latestOperators={latestOperators} />
      </Suspense>
    )
  } catch (error) {
    console.error("Failed to load homepage data:", error)
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-900 text-center text-white">
        <div>
          <h1 className="text-2xl font-bold">Oops! Qualcosa è andato storto.</h1>
          <p className="text-slate-400">Non è stato possibile caricare i dati per la homepage. Riprova più tardi.</p>
        </div>
      </div>
    )
  }
}
