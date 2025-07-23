"use server"
import { createClient } from "@/lib/supabase/server"
import { BarChart, DollarSign, MessageSquare, Phone } from "lucide-react"

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(amount)
}

export function formatDate(dateString: string) {
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
    case "written":
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
    case "written":
      return DollarSign // Placeholder
    default:
      return BarChart
  }
}

export async function getOperatorEarningsSummary(operatorId: string) {
  const supabase = createClient()
  const { data, error } = await supabase.rpc("get_operator_earnings_summary", { p_operator_id: operatorId })
  if (error) throw error
  return data
}

export async function getOperatorEarningsChartData(operatorId: string) {
  const supabase = createClient()
  const { data, error } = await supabase.rpc("get_operator_earnings_chart_data", { p_operator_id: operatorId })
  if (error) throw error
  return data
}

export async function getOperatorRecentTransactions(operatorId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("earnings")
    .select("*")
    .eq("operator_id", operatorId)
    .order("created_at", { ascending: false })
    .limit(10)
  if (error) throw error
  return data
}
