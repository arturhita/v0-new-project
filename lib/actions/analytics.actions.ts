"use server"

import { createClient } from "@/lib/supabase/server"

export async function getAnalyticsData(timeRange: "7d" | "30d" | "90d" | "1y" = "30d") {
  const supabase = createClient()

  try {
    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()

    switch (timeRange) {
      case "7d":
        startDate.setDate(endDate.getDate() - 7)
        break
      case "30d":
        startDate.setDate(endDate.getDate() - 30)
        break
      case "90d":
        startDate.setDate(endDate.getDate() - 90)
        break
      case "1y":
        startDate.setFullYear(endDate.getFullYear() - 1)
        break
    }

    // Get various analytics data in parallel
    const [userGrowth, operatorGrowth, chatSessions, callSessions, writtenConsultations, revenue, reviews] =
      await Promise.all([
        // User growth
        supabase
          .from("profiles")
          .select("created_at")
          .eq("role", "client")
          .gte("created_at", startDate.toISOString()),

        // Operator growth
        supabase
          .from("profiles")
          .select("created_at")
          .eq("role", "operator")
          .gte("created_at", startDate.toISOString()),

        // Chat sessions
        supabase
          .from("chat_sessions")
          .select("created_at, total_cost, status")
          .gte("created_at", startDate.toISOString()),

        // Call sessions
        supabase
          .from("call_sessions")
          .select("created_at, cost, status")
          .gte("created_at", startDate.toISOString()),

        // Written consultations
        supabase
          .from("written_consultations")
          .select("created_at, cost, status")
          .gte("created_at", startDate.toISOString()),

        // Revenue data (combining all sources)
        Promise.all([
          supabase
            .from("chat_sessions")
            .select("total_cost, created_at")
            .eq("status", "ended")
            .gte("created_at", startDate.toISOString()),
          supabase
            .from("call_sessions")
            .select("cost, created_at")
            .eq("status", "completed")
            .gte("created_at", startDate.toISOString()),
          supabase
            .from("written_consultations")
            .select("cost, created_at")
            .eq("status", "answered")
            .gte("created_at", startDate.toISOString()),
        ]),

        // Reviews
        supabase
          .from("reviews")
          .select("created_at, rating")
          .gte("created_at", startDate.toISOString()),
      ])

    // Process data for charts
    const processTimeSeriesData = (data: any[], valueKey: string) => {
      const dailyData: { [key: string]: number } = {}

      data.forEach((item) => {
        const date = new Date(item.created_at).toISOString().split("T")[0]
        dailyData[date] = (dailyData[date] || 0) + (item[valueKey] || 1)
      })

      return Object.entries(dailyData)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, value]) => ({ date, value }))
    }

    // Combine revenue data
    const allRevenue = [
      ...(revenue[0].data || []).map((item: any) => ({ ...item, cost: item.total_cost })),
      ...(revenue[1].data || []),
      ...(revenue[2].data || []),
    ]

    return {
      success: true,
      data: {
        userGrowth: processTimeSeriesData(userGrowth.data || [], "created_at"),
        operatorGrowth: processTimeSeriesData(operatorGrowth.data || [], "created_at"),
        chatSessions: processTimeSeriesData(chatSessions.data || [], "created_at"),
        callSessions: processTimeSeriesData(callSessions.data || [], "created_at"),
        writtenConsultations: processTimeSeriesData(writtenConsultations.data || [], "created_at"),
        revenue: processTimeSeriesData(allRevenue, "cost"),
        reviews: processTimeSeriesData(reviews.data || [], "created_at"),

        // Summary stats
        summary: {
          totalUsers: userGrowth.data?.length || 0,
          totalOperators: operatorGrowth.data?.length || 0,
          totalChatSessions: chatSessions.data?.length || 0,
          totalCallSessions: callSessions.data?.length || 0,
          totalWrittenConsultations: writtenConsultations.data?.length || 0,
          totalRevenue: allRevenue.reduce((sum, item) => sum + (item.cost || 0), 0),
          totalReviews: reviews.data?.length || 0,
          averageRating:
            reviews.data?.length > 0
              ? reviews.data.reduce((sum, review) => sum + review.rating, 0) / reviews.data.length
              : 0,
        },
      },
    }
  } catch (error) {
    console.error("Error fetching analytics data:", error)
    return { success: false, error: "Failed to fetch analytics data" }
  }
}

export async function getOperatorAnalytics(operatorId: string, timeRange: "7d" | "30d" | "90d" | "1y" = "30d") {
  const supabase = createClient()

  try {
    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()

    switch (timeRange) {
      case "7d":
        startDate.setDate(endDate.getDate() - 7)
        break
      case "30d":
        startDate.setDate(endDate.getDate() - 30)
        break
      case "90d":
        startDate.setDate(endDate.getDate() - 90)
        break
      case "1y":
        startDate.setFullYear(endDate.getFullYear() - 1)
        break
    }

    // Get operator-specific analytics
    const [chatSessions, callSessions, writtenConsultations, reviews] = await Promise.all([
      supabase
        .from("chat_sessions")
        .select("created_at, total_cost, status, total_duration")
        .eq("operator_id", operatorId)
        .gte("created_at", startDate.toISOString()),

      supabase
        .from("call_sessions")
        .select("created_at, cost, status, duration")
        .eq("operator_id", operatorId)
        .gte("created_at", startDate.toISOString()),

      supabase
        .from("written_consultations")
        .select("created_at, cost, status")
        .eq("operator_id", operatorId)
        .gte("created_at", startDate.toISOString()),

      supabase
        .from("reviews")
        .select("created_at, rating")
        .eq("operator_id", operatorId)
        .gte("created_at", startDate.toISOString()),
    ])

    // Process earnings data
    const earnings = [
      ...(chatSessions.data || [])
        .filter((s) => s.status === "ended")
        .map((s) => ({ date: s.created_at, amount: s.total_cost || 0 })),
      ...(callSessions.data || [])
        .filter((s) => s.status === "completed")
        .map((s) => ({ date: s.created_at, amount: s.cost || 0 })),
      ...(writtenConsultations.data || [])
        .filter((s) => s.status === "answered")
        .map((s) => ({ date: s.created_at, amount: s.cost || 0 })),
    ]

    const dailyEarnings: { [key: string]: number } = {}
    earnings.forEach((item) => {
      const date = new Date(item.date).toISOString().split("T")[0]
      dailyEarnings[date] = (dailyEarnings[date] || 0) + item.amount
    })

    const earningsChart = Object.entries(dailyEarnings)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, amount]) => ({ date, amount }))

    return {
      success: true,
      data: {
        earnings: earningsChart,
        summary: {
          totalChatSessions: chatSessions.data?.length || 0,
          totalCallSessions: callSessions.data?.length || 0,
          totalWrittenConsultations: writtenConsultations.data?.length || 0,
          totalEarnings: earnings.reduce((sum, item) => sum + item.amount, 0),
          totalReviews: reviews.data?.length || 0,
          averageRating:
            reviews.data?.length > 0
              ? reviews.data.reduce((sum, review) => sum + review.rating, 0) / reviews.data.length
              : 0,
          totalChatMinutes: (chatSessions.data || []).reduce((sum, s) => sum + (s.total_duration || 0), 0),
          totalCallMinutes: (callSessions.data || []).reduce((sum, s) => sum + (s.duration || 0), 0),
        },
      },
    }
  } catch (error) {
    console.error("Error fetching operator analytics:", error)
    return { success: false, error: "Failed to fetch operator analytics" }
  }
}

export async function getTopOperators(limit = 10) {
  const supabase = createClient()

  try {
    // Get operators with their earnings and stats
    const { data: operators, error } = await supabase
      .from("profiles")
      .select(`
        id,
        stage_name,
        avatar_url,
        average_rating,
        reviews_count
      `)
      .eq("role", "operator")
      .eq("status", "Attivo")
      .order("average_rating", { ascending: false })
      .limit(limit)

    if (error) throw error

    // Get earnings for each operator
    const operatorsWithEarnings = await Promise.all(
      (operators || []).map(async (operator) => {
        const [chatEarnings, callEarnings, consultationEarnings] = await Promise.all([
          supabase.from("chat_sessions").select("total_cost").eq("operator_id", operator.id).eq("status", "ended"),
          supabase.from("call_sessions").select("cost").eq("operator_id", operator.id).eq("status", "completed"),
          supabase.from("written_consultations").select("cost").eq("operator_id", operator.id).eq("status", "answered"),
        ])

        const totalEarnings = [
          ...(chatEarnings.data || []).map((s) => s.total_cost || 0),
          ...(callEarnings.data || []).map((s) => s.cost || 0),
          ...(consultationEarnings.data || []).map((s) => s.cost || 0),
        ].reduce((sum, cost) => sum + cost, 0)

        return {
          ...operator,
          totalEarnings,
        }
      }),
    )

    return {
      success: true,
      data: operatorsWithEarnings.sort((a, b) => b.totalEarnings - a.totalEarnings),
    }
  } catch (error) {
    console.error("Error fetching top operators:", error)
    return { success: false, error: "Failed to fetch top operators" }
  }
}
