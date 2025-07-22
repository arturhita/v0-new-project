import { getHomepageData } from "@/lib/actions/data.actions"
import HomepageClient from "./homepage-client"
import { Suspense } from "react"
import LoadingSpinner from "@/components/loading-spinner"

export const revalidate = 3600 // Revalida i dati ogni ora

export default async function HomePage() {
  // I dati vengono caricati sul server
  const { operators, reviews } = await getHomepageData()

  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center bg-slate-900">
          <LoadingSpinner />
        </div>
      }
    >
      <HomepageClient operators={operators} reviews={reviews} />
    </Suspense>
  )
}
