"use server"

import { createClient } from "@/lib/supabase/server"
import { unstable_noStore as noStore } from "next/cache"

export interface EarningsSummary {
  totalEarnings: number
  monthlyEarnings: number
  weeklyEarnings: number
  dailyEarnings: number
  totalConsultations: number
  monthlyConsultations: number
  weeklyConsultations: number
  dailyConsultations: number
  monthlyGrowthRate: number
}

export interface ChartDataPoint {
  date: string
  earnings: number
  consultations: number
}

export interface Transaction {
  id: string
  serviceType: "chat" | "call" | "written"
  grossAmount: number
  commissionAmount: number
  netAmount: number
  durationMinutes?: number
  status: "pending" | "completed" | "cancelled"
  createdAt: string
}

export async function getOperatorEarningsSummary(operatorId: string): Promise<EarningsSummary> {
  noStore()
  const supabase = createClient()

  const { data, error } = await supabase.rpc("get_operator_earnings_summary", {
    p_operator_id: operatorId,
  })

  if (error) {
    console.error("Error fetching earnings summary:", error)
    return {
      totalEarnings: 0,
      monthlyEarnings: 0,
      weeklyEarnings: 0,
      dailyEarnings: 0,
      totalConsultations: 0,
      monthlyConsultations: 0,
      weeklyConsultations: 0,
      dailyConsultations: 0,
      monthlyGrowthRate: 0,
    }
  }

  const summary = data[0]
  return {
    totalEarnings: Number(summary.total_earnings) || 0,
    monthlyEarnings: Number(summary.monthly_earnings) || 0,
    weeklyEarnings: Number(summary.weekly_earnings) || 0,
    dailyEarnings: Number(summary.daily_earnings) || 0,
    totalConsultations: summary.total_consultations || 0,
    monthlyConsultations: summary.monthly_consultations || 0,
    weeklyConsultations: summary.weekly_consultations || 0,
    dailyConsultations: summary.daily_consultations || 0,
    monthlyGrowthRate: Number(summary.monthly_growth_rate) || 0,
  }
}

export async function getOperatorEarningsChartData(operatorId: string, days = 30): Promise<ChartDataPoint[]> {
  noStore()
  const supabase = createClient()

  const { data, error } = await supabase.rpc("get_operator_earnings_chart_data", {
    p_operator_id: operatorId,
    p_days: days,
  })

  if (error) {
    console.error("Error fetching chart data:", error)
    return []
  }

  return (data || []).map((item) => ({
    date: item.date,
    earnings: Number(item.earnings) || 0,
    consultations: item.consultations || 0,
  }))
}

export async function getOperatorRecentTransactions(operatorId: string, limit = 10): Promise<Transaction[]> {
  noStore()
  const supabase = createClient()

  const { data, error } = await supabase.rpc("get_operator_recent_transactions", {
    p_operator_id: operatorId,
    p_limit: limit,
  })

  if (error) {
    console.error("Error fetching recent transactions:", error)
    return []
  }

  return (data || []).map((item) => ({
    id: item.id,
    serviceType: item.service_type as "chat" | "call" | "written",
    grossAmount: Number(item.gross_amount) || 0,
    commissionAmount: Number(item.commission_amount) || 0,
    netAmount: Number(item.net_amount) || 0,
    durationMinutes: item.duration_minutes,
    status: item.status as "pending" | "completed" | "cancelled",
    createdAt: item.created_at,
  }))
}

export async function recordOperatorEarning(
  operatorId: string,
  serviceType: "chat" | "call" | "written",
  grossAmount: number,
  durationMinutes?: number,
  consultationId?: string,
  commissionRate = 0.15,
): Promise<{ success: boolean; earningId?: string; error?: string }> {
  const supabase = createClient()

  const { data, error } = await supabase.rpc("record_operator_earning", {
    p_operator_id: operatorId,
    p_service_type: serviceType,
    p_gross_amount: grossAmount,
    p_duration_minutes: durationMinutes,
    p_consultation_id: consultationId,
    p_commission_rate: commissionRate,
  })

  if (error) {
    console.error("Error recording earning:", error)
    return { success: false, error: error.message }
  }

  return { success: true, earningId: data }
}

// Helper functions
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(amount)
}

export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString))
}

export function getServiceTypeLabel(serviceType: string): string {
  const labels = {
    chat: "Chat",
    call: "Chiamata",
    written: "Consulto Scritto",
  }
  return labels[serviceType as keyof typeof labels] || serviceType
}

export function getServiceTypeIcon(serviceType: string): string {
  const icons = {
    chat: "💬",
    call: "📞",
    written: "✍️",
  }
  return icons[serviceType as keyof typeof icons] || "💫"
}
