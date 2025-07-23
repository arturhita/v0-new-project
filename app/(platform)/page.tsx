import { getHomepageData } from "@/lib/actions/data.actions"
import HomepageClient from "./homepage-client"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

export const revalidate = 60 // Revalidate data every 60 seconds

export default async function HomePage() {
  const initialData = await getHomepageData()

  if (initialData.error) {
    return <div className="text-center text-red-500 py-10">Errore nel caricamento dei dati della homepage.</div>
  }

  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-64 w-full mb-12" />
          <div className="mb-8">
            <Skeleton className="h-8 w-1/3 mb-4" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-80 w-full" />
              ))}
            </div>
          </div>
        </div>
      }
    >
      <HomepageClient initialData={initialData.data} />
    </Suspense>
  )
}
