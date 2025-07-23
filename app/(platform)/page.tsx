"use client"
import { getHomepageData } from "@/lib/actions/data.actions"
import { HomepageClient } from "./homepage-client"
import { Suspense } from "react"
import { LoadingSpinner } from "@/components/loading-spinner"

export default async function UnveillyHomePage() {
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
