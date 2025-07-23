import { Suspense } from "react"
import { getHomepageData, getLatestOperators } from "@/lib/actions/data.actions"
import { HomepageClient } from "./homepage-client"
import LoadingSpinner from "@/components/loading-spinner"

export default async function UnveillyHomePage() {
  try {
    // Recupera i dati in parallelo per ottimizzare i tempi di caricamento
    const [data, latestOperators] = await Promise.all([getHomepageData(), getLatestOperators()])

    return (
      <Suspense
        fallback={
          <div className="flex h-screen w-full items-center justify-center bg-slate-900">
            <LoadingSpinner />
          </div>
        }
      >
        <HomepageClient operators={data.operators} reviews={data.reviews} latestOperators={latestOperators} />
      </Suspense>
    )
  } catch (error) {
    console.error("Failed to load homepage data on the server:", error)
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
