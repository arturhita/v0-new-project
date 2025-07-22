"use server"
import { createClient } from "@/lib/supabase/server"
import { CircleDollarSign, MessageSquare, Phone } from "lucide-react"

export function formatCurrency(amount: number | null | undefined) {
  if (amount === null || amount === undefined) return "€0.00"
  return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(amount)
}

export function formatDate(dateString: string | null | undefined) {
  if (!dateString) return "-"
  return new Date(dateString).toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export function getServiceTypeLabel(type: string) {
  switch (type) {
    case "chat":
      return "Chat"
    case "call":
      return "Chiamata"
    case "written_consultation":
      return "Consulto Scritto"
    default:
      return "Sconosciuto"
  }
}

export function getServiceTypeIcon(type: string) {
  switch (type) {
    case "chat":
      return MessageSquare
    case "call":
      return Phone
    case "written_consultation":
      return CircleDollarSign // Placeholder icon
    default:
      return CircleDollarSign
  }
}

export async function getOperatorEarningsSummary() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase.rpc("get_operator_earnings_summary", { p_operator_id: user.id })
  if (error) {
    console.error("Error fetching earnings summary:", error)
    return null
  }
  return data[0]
}

export async function getOperatorEarningsChartData() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase.rpc("get_operator_earnings_chart_data", { p_operator_id: user.id })
  if (error) {
    console.error("Error fetching chart data:", error)
    return []
  }
  return data
}

export async function getOperatorRecentTransactions() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from("earnings")
    .select("*")
    .eq("operator_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10)

  if (error) {
    console.error("Error fetching recent transactions:", error)
    return []
  }
  return data
}
