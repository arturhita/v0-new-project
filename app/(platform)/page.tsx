import { Suspense } from "react"
import { getHomepageData } from "@/lib/actions/data.actions"
import HomepageClient from "./homepage-client"
import LoadingSpinner from "@/components/loading-spinner"

export default async function Page() {
  // The data fetching is deferred to the client component inside Suspense
  return (
    <Suspense fallback={<LoadingSpinner fullScreen message="Caricamento homepage..." />}>
      <HomepageClientLoader />
    </Suspense>
  )
}

// Helper component to fetch data within the Suspense boundary
async function HomepageClientLoader() {
  const homepageData = await getHomepageData()
  return <HomepageClient initialData={homepageData} />
}
