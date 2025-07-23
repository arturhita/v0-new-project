import type React from "react"
;("use server")

import { createClient } from "@/lib/supabase/server"
import { unstable_noStore as noStore } from "next/cache"
import { BarChart, DollarSign, MessageSquare, Phone, FileText } from "lucide-react"

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(amount)
}

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export const getServiceTypeLabel = (type: string) => {
  const labels: { [key: string]: string } = {
    chat: "Chat",
    call: "Chiamata",
    written_consultation: "Consulto Scritto",
    bonus: "Bonus",
    adjustment: "Aggiornamento",
  }
  return labels[type] || "Sconosciuto"
}

export const getServiceTypeIcon = (type: string) => {
  const icons: { [key: string]: React.ElementType } = {
    chat: MessageSquare,
    call: Phone,
    written_consultation: FileText,
    bonus: DollarSign,
    adjustment: BarChart,
  }
  return icons[type] || DollarSign
}

export async function getOperatorEarningsSummary(operatorId: string) {
  noStore()
  const supabase = createClient()
  const { data, error } = await supabase.rpc("get_operator_earnings_summary", { p_operator_id: operatorId })

  if (error) {
    console.error("Error fetching earnings summary:", error)
    return {
      total_earnings: 0,
      pending_payout: 0,
      last_payout: 0,
    }
  }
  return data[0]
}

export async function getOperatorEarningsChartData(operatorId: string) {
  noStore()
  const supabase = createClient()
  const { data, error } = await supabase.rpc("get_operator_earnings_chart_data", { p_operator_id: operatorId })

  if (error) {
    console.error("Error fetching chart data:", error)
    return []
  }
  return data
}

export async function getOperatorRecentTransactions(operatorId: string) {
  noStore()
  const supabase = createClient()
  const { data, error } = await supabase
    .from("earnings")
    .select("*")
    .eq("operator_id", operatorId)
    .order("created_at", { ascending: false })
    .limit(10)

  if (error) {
    console.error("Error fetching recent transactions:", error)
    return []
  }
  return data
}
