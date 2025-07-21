"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export interface EarningsSummary {
  totalEarnings: number
  monthlyEarnings: number
  weeklyEarnings: number
  dailyEarnings: number
  totalConsultations: number
  monthlyConsultations: number
  weeklyConsultations: number
  dailyConsultations: number
}

export interface EarningsChartData {
  date: string
  earnings: number
  consultations: number
}

export interface RecentTransaction {
  id: string
  serviceType: "chat" | "call" | "written"
  grossAmount: number
  platformCommission: number
  netAmount: number
  durationMinutes?: number
  createdAt: string
  consultationId?: string
}

export async function getOperatorEarningsSummary(operatorId: string): Promise<EarningsSummary | null> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase.rpc("get_operator_earnings_summary", { p_operator_id: operatorId }).single()

    if (error) {
      console.error("Error fetching earnings summary:", error)
      return null
    }

    return {
      totalEarnings: Number.parseFloat(data.total_earnings || "0"),
      monthlyEarnings: Number.parseFloat(data.monthly_earnings || "0"),
      weeklyEarnings: Number.parseFloat(data.weekly_earnings || "0"),
      dailyEarnings: Number.parseFloat(data.daily_earnings || "0"),
      totalConsultations: data.total_consultations || 0,
      monthlyConsultations: data.monthly_consultations || 0,
      weeklyConsultations: data.weekly_consultations || 0,
      dailyConsultations: data.daily_consultations || 0,
    }
  } catch (error) {
    console.error("Error in getOperatorEarningsSummary:", error)
    return null
  }
}

export async function getOperatorEarningsChartData(operatorId: string, days = 30): Promise<EarningsChartData[]> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase.rpc("get_operator_earnings_chart_data", {
      p_operator_id: operatorId,
      p_days: days,
    })

    if (error) {
      console.error("Error fetching earnings chart data:", error)
      return []
    }

    return data.map((item: any) => ({
      date: item.date,
      earnings: Number.parseFloat(item.earnings || "0"),
      consultations: item.consultations || 0,
    }))
  } catch (error) {
    console.error("Error in getOperatorEarningsChartData:", error)
    return []
  }
}

export async function getOperatorRecentTransactions(operatorId: string, limit = 10): Promise<RecentTransaction[]> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase.rpc("get_operator_recent_transactions", {
      p_operator_id: operatorId,
      p_limit: limit,
    })

    if (error) {
      console.error("Error fetching recent transactions:", error)
      return []
    }

    return data.map((item: any) => ({
      id: item.id,
      serviceType: item.service_type,
      grossAmount: Number.parseFloat(item.gross_amount || "0"),
      platformCommission: Number.parseFloat(item.platform_commission || "0"),
      netAmount: Number.parseFloat(item.net_amount || "0"),
      durationMinutes: item.duration_minutes,
      createdAt: item.created_at,
      consultationId: item.consultation_id,
    }))
  } catch (error) {
    console.error("Error in getOperatorRecentTransactions:", error)
    return []
  }
}

export async function recordOperatorEarning(
  operatorId: string,
  serviceType: "chat" | "call" | "written",
  grossAmount: number,
  consultationId?: string,
  durationMinutes?: number,
): Promise<string | null> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase.rpc("record_operator_earning", {
      p_operator_id: operatorId,
      p_service_type: serviceType,
      p_gross_amount: grossAmount,
      p_consultation_id: consultationId || null,
      p_duration_minutes: durationMinutes || null,
    })

    if (error) {
      console.error("Error recording operator earning:", error)
      return null
    }

    // Revalidate earnings pages
    revalidatePath("/dashboard/operator/earnings")
    revalidatePath("/admin/analytics")

    return data
  } catch (error) {
    console.error("Error in recordOperatorEarning:", error)
    return null
  }
}

// Helper functions
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatServiceType(serviceType: string): string {
  const serviceNames = {
    chat: "Chat",
    call: "Chiamata",
    written: "Consulto Scritto",
  }
  return serviceNames[serviceType as keyof typeof serviceNames] || serviceType
}

export function calculateGrowthPercentage(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

export function formatDuration(minutes?: number): string {
  if (!minutes) return "N/A"

  if (minutes < 60) {
    return `${minutes}m`
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (remainingMinutes === 0) {
    return `${hours}h`
  }

  return `${hours}h ${remainingMinutes}m`
}
