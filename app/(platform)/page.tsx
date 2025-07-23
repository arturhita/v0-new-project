import { Suspense } from "react"
import { getHomepageData } from "@/lib/actions/data.actions"
import { HomepageClient } from "./homepage-client"
import { LoadingSpinner } from "@/components/loading-spinner"

// This is now a Server Component, which is the recommended way to fetch data in Next.js.
// It fetches data on the server and passes it down to a Client Component for interactivity.
export default async function UnveillyHomePage() {
  try {
    // Fetch data directly on the server.
    const data = await getHomepageData()

    // Pass the clean data as props to the Client Component.
    return (
      <Suspense
        fallback={
          <div className="flex h-screen w-full items-center justify-center bg-slate-900">
            <LoadingSpinner />
          </div>
        }
      >
        <HomepageClient operators={data.operators} reviews={data.reviews} />
      </Suspense>
    )
  } catch (error) {
    console.error("Failed to load homepage data on the server:", error)
    // Render a user-friendly error message if data fetching fails.
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-900 text-center text-white">
        <div>
          <p className="text-xl font-bold">Qualcosa è andato storto</p>
          <p className="text-slate-400">Impossibile caricare i dati della homepage. Riprova più tardi.</p>
        </div>
      </div>
    )
  }
}
