import { Suspense } from "react"
import HomepageClient from "./homepage-client"
import { getHomepageData } from "@/lib/actions/data.actions"
import LoadingSpinner from "@/components/loading-spinner"

export const revalidate = 300 // Revalidate every 5 minutes

export default async function HomePage() {
  const homepageData = await getHomepageData()

  return (
    <Suspense
      fallback={
        <div className="w-full h-screen flex items-center justify-center bg-slate-900">
          <LoadingSpinner />
        </div>
      }
    >
      <HomepageClient initialData={homepageData} />
    </Suspense>
  )
}
