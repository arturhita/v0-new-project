import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import LoadingSpinner from "@/components/loading-spinner"
import EarningsClientPage from "./EarningsClientPage"
import {
  getOperatorEarningsSummary,
  getOperatorEarningsChartData,
  getOperatorRecentTransactions,
} from "@/lib/actions/earnings.actions"

export default async function EarningsPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect("/login")
  }

  // Check if user is an operator
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (!profile || profile.role !== "operator") {
    return redirect("/dashboard/client")
  }

  // Fetch all earnings data in parallel
  const [summary, chartData, transactions] = await Promise.all([
    getOperatorEarningsSummary(user.id),
    getOperatorEarningsChartData(user.id, 30),
    getOperatorRecentTransactions(user.id, 15),
  ])

  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center">
          <LoadingSpinner />
        </div>
      }
    >
      <EarningsClientPage
        user={user}
        initialSummary={summary}
        initialChartData={chartData}
        initialTransactions={transactions}
      />
    </Suspense>
  )
}
