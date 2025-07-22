"use client"
import { getHomepageData } from "@/lib/actions/data.actions"
import { HomepageClient } from "./homepage-client"
import { Suspense, useEffect, useState } from "react"
import LoadingSpinner from "@/components/loading-spinner" // CORREZIONE: Importazione predefinita
import type { Operator } from "@/components/operator-card"
import type { Review } from "@/components/review-card"

export default function UnveillyHomePage() {
  const [data, setData] = useState<{ operators: Operator[]; reviews: Review[] } | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getHomepageData()
      .then(setData)
      .catch((e) => {
        console.error("Failed to load homepage data:", e)
        setError("Impossibile caricare i dati della homepage.")
      })
  }, [])

  if (error) {
    return <div className="flex h-screen w-full items-center justify-center bg-slate-900 text-white">{error}</div>
  }

  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center bg-slate-900">
          <LoadingSpinner />
        </div>
      }
    >
      {data ? (
        <HomepageClient operators={data.operators} reviews={data.reviews} />
      ) : (
        <div className="flex h-screen w-full items-center justify-center bg-slate-900">
          <LoadingSpinner />
        </div>
      )}
    </Suspense>
  )
}
