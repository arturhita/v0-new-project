"use server"

import { createClient } from "@/lib/supabase/server"

export async function getComprehensiveAnalytics() {
  const supabase = createClient()

  try {
    // User analytics
    const { count: totalUsers } = await supabase.from("profiles").select("*", { count: "exact", head: true })

    const { count: totalOperators } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "operator")

    const { count: activeOperators } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "operator")
      .eq("is_online", true)

    // Session analytics
    const { count: totalChatSessions } = await supabase
      .from("chat_sessions")
      .select("*", { count: "exact", head: true })

    const { count: totalCallSessions } = await supabase
      .from("call_sessions")
      .select("*", { count: "exact", head: true })

    const { count: totalWrittenConsultations } = await supabase
      .from("written_consultations")
      .select("*", { count: "exact", head: true })

    // Revenue analytics
    const { data: revenueData } = await supabase
      .from("wallet_transactions")
      .select("amount, created_at, transaction_type")
      .eq("transaction_type", "credit")

    const totalRevenue = revenueData?.reduce((sum, transaction) => sum + transaction.amount, 0) || 0

    // Monthly revenue
    const monthlyRevenue =
      revenueData
        ?.filter((transaction) => {
          const transactionDate = new Date(transaction.created_at)
          const currentMonth = new Date()
          return (
            transactionDate.getMonth() === currentMonth.getMonth() &&
            transactionDate.getFullYear() === currentMonth.getFullYear()
          )
        })
        .reduce((sum, transaction) => sum + transaction.amount, 0) || 0

    return {
      users: {
        total: totalUsers || 0,
        operators: totalOperators || 0,
        activeOperators: activeOperators || 0,
        clients: (totalUsers || 0) - (totalOperators || 0),
      },
      sessions: {
        totalChat: totalChatSessions || 0,
        totalCall: totalCallSessions || 0,
        totalWritten: totalWrittenConsultations || 0,
        total: (totalChatSessions || 0) + (totalCallSessions || 0) + (totalWrittenConsultations || 0),
      },
      revenue: {
        total: totalRevenue,
        monthly: monthlyRevenue,
        transactions: revenueData || [],
      },
    }
  } catch (error) {
    console.error("Error fetching comprehensive analytics:", error)
    return {
      users: { total: 0, operators: 0, activeOperators: 0, clients: 0 },
      sessions: { totalChat: 0, totalCall: 0, totalWritten: 0, total: 0 },
      revenue: { total: 0, monthly: 0, transactions: [] },
    }
  }
}
