"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export interface Payout {
  id: string
  operator_id: string
  operator_name?: string
  amount: number
  status: "pending" | "processing" | "completed" | "failed"
  payment_method: string
  payment_details: any
  created_at: string
  updated_at: string
  processed_at?: string
  notes?: string
}

export async function createPayoutRequest(payoutData: {
  amount: number
  payment_method: string
  payment_details: any
}) {
  const supabase = createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: "User not authenticated" }
    }

    // Verify user is an operator
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profileError || profile?.role !== "operator") {
      return { success: false, error: "Only operators can request payouts" }
    }

    // Create payout request
    const { data, error } = await supabase
      .from("payouts")
      .insert({
        operator_id: user.id,
        amount: payoutData.amount,
        payment_method: payoutData.payment_method,
        payment_details: payoutData.payment_details,
        status: "pending",
      })
      .select()
      .single()

    if (error) throw error

    revalidatePath("/dashboard/operator/payouts")
    return { success: true, payout: data }
  } catch (error) {
    console.error("Error creating payout request:", error)
    return { success: false, error: "Failed to create payout request" }
  }
}

export async function getPayouts() {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from("payouts")
      .select(`
        *,
        operator:profiles!payouts_operator_id_fkey(stage_name, email)
      `)
      .order("created_at", { ascending: false })

    if (error) throw error

    return (data || []).map((payout) => ({
      ...payout,
      operator_name: payout.operator?.stage_name || "Unknown Operator",
    }))
  } catch (error) {
    console.error("Error fetching payouts:", error)
    return []
  }
}

export async function getOperatorPayouts(operatorId?: string) {
  const supabase = createClient()

  try {
    let userId = operatorId
    if (!userId) {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return []
      userId = user.id
    }

    const { data, error } = await supabase
      .from("payouts")
      .select("*")
      .eq("operator_id", userId)
      .order("created_at", { ascending: false })

    if (error) throw error

    return data || []
  } catch (error) {
    console.error("Error fetching operator payouts:", error)
    return []
  }
}

export async function updatePayoutStatus(
  payoutId: string,
  status: "processing" | "completed" | "failed",
  notes?: string,
) {
  const supabase = createClient()

  try {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    }

    if (notes) {
      updateData.notes = notes
    }

    if (status === "completed" || status === "failed") {
      updateData.processed_at = new Date().toISOString()
    }

    const { error } = await supabase.from("payouts").update(updateData).eq("id", payoutId)

    if (error) throw error

    revalidatePath("/admin/payouts")
    return { success: true }
  } catch (error) {
    console.error("Error updating payout status:", error)
    return { success: false, error: "Failed to update payout status" }
  }
}

export async function getPayoutStats(operatorId?: string) {
  const supabase = createClient()

  try {
    let query = supabase.from("payouts").select("amount, status")

    if (operatorId) {
      query = query.eq("operator_id", operatorId)
    }

    const { data, error } = await query

    if (error) throw error

    const payouts = data || []
    const totalRequested = payouts.reduce((sum, payout) => sum + payout.amount, 0)
    const totalCompleted = payouts
      .filter((payout) => payout.status === "completed")
      .reduce((sum, payout) => sum + payout.amount, 0)
    const pendingAmount = payouts
      .filter((payout) => payout.status === "pending")
      .reduce((sum, payout) => sum + payout.amount, 0)

    return {
      totalRequested,
      totalCompleted,
      pendingAmount,
      totalPayouts: payouts.length,
      completedPayouts: payouts.filter((p) => p.status === "completed").length,
      pendingPayouts: payouts.filter((p) => p.status === "pending").length,
    }
  } catch (error) {
    console.error("Error fetching payout stats:", error)
    return {
      totalRequested: 0,
      totalCompleted: 0,
      pendingAmount: 0,
      totalPayouts: 0,
      completedPayouts: 0,
      pendingPayouts: 0,
    }
  }
}
