import type React from "react"
;("use server")

import { createClient } from "@/lib/supabase/server"
import { format } from "date-fns"
import { it } from "date-fns/locale"
import { BarChart, DollarSign, MessageSquare, Phone } from "lucide-react"

export function formatCurrency(amount: number | null | undefined) {
  if (amount === null || amount === undefined) {
    return "€0,00"
  }
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(amount)
}

export function formatDate(date: string | Date) {
  return format(new Date(date), "d MMM yyyy", { locale: it })
}

export function getServiceTypeLabel(type: string) {
  const labels: { [key: string]: string } = {
    chat: "Chat",
    call: "Chiamata",
    email: "Consulto Scritto",
    bonus: "Bonus",
    adjustment: "Rettifica",
  }
  return labels[type] || type
}

export function getServiceTypeIcon(type: string) {
  const icons: { [key: string]: React.ElementType } = {
    chat: MessageSquare,
    call: Phone,
    email: BarChart,
    bonus: DollarSign,
    adjustment: DollarSign,
  }
  return icons[type] || DollarSign
}

export async function getOperatorEarningsSummary() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase.rpc("get_operator_earnings_summary", { p_operator_id: user.id }).single()
  if (error) {
    console.error("Error fetching earnings summary:", error)
    return null
  }
  return data
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
