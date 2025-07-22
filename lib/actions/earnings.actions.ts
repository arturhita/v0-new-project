import type React from "react"
;("use server")

import { createClient } from "@/lib/supabase/server"
import { unstable_noStore as noStore } from "next/cache"
import { Banknote, Briefcase, Coins, MinusCircle, PlusCircle, Receipt, Users } from "lucide-react"

export function formatCurrency(amount: number | null | undefined) {
  if (amount === null || amount === undefined) {
    return "€0,00"
  }
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(amount)
}

export function formatDate(dateString: string | null | undefined) {
  if (!dateString) return "N/A"
  return new Date(dateString).toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export function getServiceTypeLabel(type: string) {
  const labels: { [key: string]: string } = {
    chat: "Chat",
    call: "Chiamata",
    email: "Consulto Scritto",
    bonus: "Bonus",
    adjustment: "Rettifica",
    payout: "Pagamento",
  }
  return labels[type] || "Altro"
}

export function getServiceTypeIcon(type: string) {
  const icons: { [key: string]: React.ElementType } = {
    chat: Users,
    call: Banknote,
    email: Briefcase,
    bonus: PlusCircle,
    adjustment: MinusCircle,
    payout: Receipt,
  }
  return icons[type] || Coins
}

export async function getOperatorEarningsSummary(operatorId: string) {
  noStore()
  const supabase = createClient()
  const { data, error } = await supabase.rpc("get_operator_earnings_summary", { p_operator_id: operatorId })

  if (error) {
    console.error("Error fetching earnings summary:", error)
    return {
      totalRevenue: 0,
      netEarnings: 0,
      pendingPayout: 0,
      paidOut: 0,
    }
  }
  return data[0]
}

export async function getOperatorEarningsChartData(operatorId: string) {
  noStore()
  const supabase = createClient()
  const { data, error } = await supabase.rpc("get_operator_monthly_earnings_chart", { p_operator_id: operatorId })

  if (error) {
    console.error("Error fetching earnings chart data:", error)
    return []
  }
  return data
}

export async function getOperatorRecentTransactions(operatorId: string) {
  noStore()
  const supabase = createClient()
  const { data, error } = await supabase.rpc("get_operator_recent_transactions", { p_operator_id: operatorId })

  if (error) {
    console.error("Error fetching recent transactions:", error)
    return []
  }
  return data
}
