"use server"
import createServerClient from "@/lib/supabase/server"
import type { LucideIcon } from "lucide-react"

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
  const labels: { [key: string]: string } = {
    chat: "Chat",
    call: "Chiamata",
    written_consultation: "Consulto Scritto",
  }
  return labels[type] || "Sconosciuto"
}

export function getServiceTypeIcon(type: string): LucideIcon | null {
  // This requires you to import the icons in the component where you use this.
  // Example: import { MessageCircle, Phone, FileText } from 'lucide-react'
  return null
}

export async function getOperatorEarningsSummary() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null
  const { data, error } = await supabase.rpc("get_operator_earnings_summary", { p_operator_id: user.id }).single()
  if (error) return null
  return data
}

export async function getOperatorEarningsChartData() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []
  const { data, error } = await supabase.rpc("get_operator_earnings_chart_data", { p_operator_id: user.id })
  if (error) return []
  return data
}

export async function getOperatorRecentTransactions() {
  const supabase = await createServerClient()
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
  if (error) return []
  return data
}
