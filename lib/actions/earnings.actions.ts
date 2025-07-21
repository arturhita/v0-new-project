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
  platformCommission: number
  netAmount: number
  durationMinutes?: number
  createdAt: string
  consultationId?: string
}

export async function getOperatorEarningsSummary(operatorId: string): Promise<EarningsSummary | null> {
  noStore()
  const supabase = createClient()

  try {
    const { data, error } = await supabase.rpc("get_operator_earnings_summary", {
      p_operator_id: operatorId,
    })

    if (error) {
      console.error("Error fetching earnings summary:", error)
      return null
    }

    if (!data || data.length === 0) {
      return {
        totalEarnings: 0,
        monthlyEarnings: 0,
        weeklyEarnings: 0,
        dailyEarnings: 0,
        totalConsultations: 0,
        monthlyConsultations: 0,
        weeklyConsultations: 0,
        dailyConsultations: 0,
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
    }
  } catch (error) {
    console.error("Error in getOperatorEarningsSummary:", error)
    return null
  }
}

export async function getOperatorEarningsChartData(operatorId: string, days = 30): Promise<ChartDataPoint[]> {
  noStore()
  const supabase = createClient()

  try {
    const { data, error } = await supabase.rpc("get_operator_earnings_chart_data", {
      p_operator_id: operatorId,
      p_days: days,
    })

    if (error) {
      console.error("Error fetching earnings chart data:", error)
      return []
    }

    return (data || []).map((item: any) => ({
      date: item.date,
      earnings: Number(item.earnings) || 0,
      consultations: item.consultations || 0,
    }))
  } catch (error) {
    console.error("Error in getOperatorEarningsChartData:", error)
    return []
  }
}

export async function getOperatorRecentTransactions(operatorId: string, limit = 10): Promise<Transaction[]> {
  noStore()
  const supabase = createClient()

  try {
    const { data, error } = await supabase.rpc("get_operator_recent_transactions", {
      p_operator_id: operatorId,
      p_limit: limit,
    })

    if (error) {
      console.error("Error fetching recent transactions:", error)
      return []
    }

    return (data || []).map((item: any) => ({
      id: item.id,
      serviceType: item.service_type,
      grossAmount: Number(item.gross_amount) || 0,
      platformCommission: Number(item.platform_commission) || 0,
      netAmount: Number(item.net_amount) || 0,
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
): Promise<{ success: boolean; earningId?: string; error?: string }> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase.rpc("record_operator_earning", {
      p_operator_id: operatorId,
      p_consultation_id: consultationId || null,
      p_service_type: serviceType,
      p_gross_amount: grossAmount,
      p_duration_minutes: durationMinutes || null,
    })

    if (error) {
      console.error("Error recording operator earning:", error)
      return { success: false, error: error.message }
    }

    return { success: true, earningId: data }
  } catch (error) {
    console.error("Error in recordOperatorEarning:", error)
    return { success: false, error: "Errore interno del server" }
  }
}

// Helper function to format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

// Helper function to get service type display name
export function getServiceTypeDisplayName(serviceType: string): string {
  switch (serviceType) {
    case "chat":
      return "Chat"
    case "call":
      return "Chiamata"
    case "written":
      return "Consulto Scritto"
    default:
      return serviceType
  }
}

// Helper function to calculate growth percentage
export function calculateGrowthPercentage(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}
