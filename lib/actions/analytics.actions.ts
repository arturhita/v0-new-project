"use server"

import { createClient } from "@/lib/supabase/server"
import { subMonths, startOfMonth, format, endOfMonth } from "date-fns"

export async function getComprehensiveAnalytics() {
  const supabase = createClient()
  const now = new Date()

  const timeSeriesPromises = Array.from({ length: 12 }).map((_, i) => {
    const date = subMonths(now, 11 - i)
    const monthStart = startOfMonth(date).toISOString()
    const monthEnd = endOfMonth(date).toISOString()
    const monthLabel = format(date, "MMM yy")

    const revenuePromise = supabase
      .from("transactions")
      .select("amount")
      .eq("type", "deposit")
      .gte("created_at", monthStart)
      .lt("created_at", monthEnd)

    const usersPromise = supabase
      .from("profiles")
      .select("id", { count: "exact" })
      .gte("created_at", monthStart)
      .lt("created_at", monthEnd)

    const consultationsPromise = supabase
      .from("consultations")
      .select("id", { count: "exact" })
      .gte("created_at", monthStart)
      .lt("created_at", monthEnd)

    return Promise.all([revenuePromise, usersPromise, consultationsPromise]).then(
      ([revenueRes, usersRes, consultationsRes]) => ({
        month: monthLabel,
        revenue: revenueRes.data?.reduce((sum, t) => sum + t.amount, 0) || 0,
        users: usersRes.count || 0,
        consultations: consultationsRes.count || 0,
      }),
    )
  })

  const thisMonthStart = startOfMonth(now).toISOString()
  const topOperatorsPromise = supabase.rpc("get_top_operators_by_consultations", {
    from_date: thisMonthStart,
    to_date: now.toISOString(),
    limit_count: 5,
  })

  const popularCategoriesPromise = supabase.rpc("get_consultation_counts_by_category")

  const [
    timeSeriesData,
    { data: topOperatorsData, error: topOperatorsError },
    { data: popularCategoriesData, error: popularCategoriesError },
  ] = await Promise.all([Promise.all(timeSeriesPromises), topOperatorsPromise, popularCategoriesPromise])

  if (topOperatorsError) console.error("Error fetching top operators:", topOperatorsError)
  if (popularCategoriesError) console.error("Error fetching popular categories:", popularCategoriesError)

  return {
    timeSeries: timeSeriesData,
    topOperators: topOperatorsData || [],
    popularCategories: popularCategoriesData || [],
  }
}
