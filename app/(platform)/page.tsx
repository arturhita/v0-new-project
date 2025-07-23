"use client"

import { useEffect, useState, Suspense } from "react"
import { getHomepageData } from "@/lib/actions/data.actions"
import { HomepageClient } from "./homepage-client"
import { LoadingSpinner } from "@/components/loading-spinner"
import type { Operator } from "@/components/operator-card"
import type { Review } from "@/components/review-card"

interface HomepageData {
  operators: Operator[]
  reviews: Review[]
}

export default function UnveillyHomePage() {
  const [data, setData] = useState<HomepageData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const result = await getHomepageData()
        setData(result)
        setError(null)
      } catch (e: any) {
        console.error("Failed to load homepage data in component:", e)
        setError("Impossibile caricare i dati della homepage. Riprova più tardi.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-900">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-900 text-center text-white">
        <div>
          <p className="text-xl font-bold">Qualcosa è andato storto</p>
          <p className="text-slate-400">{error}</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-900 text-center text-white">
        <p>Nessun dato da visualizzare.</p>
      </div>
    )
  }

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
}
