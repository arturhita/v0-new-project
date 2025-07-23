import { Suspense } from "react"
import { getHomepageData } from "@/lib/actions/data.actions"
import { HomepageClient } from "./homepage-client"
import { LoadingSpinner } from "@/components/loading-spinner"

// Questo è un Server Component, che recupera i dati sul server e li passa
// a un Client Component per l'interattività.
export default async function UnveillyHomePage() {
  try {
    // Recupera i dati direttamente sul server.
    const data = await getHomepageData()

    // Passa i dati già puliti come props al Client Component.
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
    // Mostra un messaggio di errore se il recupero dati fallisce.
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
