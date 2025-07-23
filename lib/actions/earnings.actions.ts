import type React from "react"
;("use server")
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { Phone, MessageSquare, Edit } from "lucide-react"

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
  const map: { [key: string]: string } = { call: "Chiamata", chat: "Chat", written: "Scritto" }
  return map[type] || "Sconosciuto"
}

export function getServiceTypeIcon(type: string) {
  const map: { [key: string]: React.ElementType } = { call: Phone, chat: MessageSquare, written: Edit }
  return map[type] || Edit
}

export async function getOperatorEarningsSummary() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const adminSupabase = createAdminClient()
  const { data, error } = await adminSupabase.rpc("get_operator_earnings_summary", { p_operator_id: user.id }).single()
  if (error) return null
  return data
}

export async function getOperatorEarningsChartData() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const adminSupabase = createAdminClient()
  const { data, error } = await adminSupabase.rpc("get_operator_earnings_chart_data", { p_operator_id: user.id })
  if (error) return []
  return data
}

export async function getOperatorRecentTransactions() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const adminSupabase = createAdminClient()
  const { data, error } = await adminSupabase
    .from("earnings")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10)
  if (error) return []
  return data
}
