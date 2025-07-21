"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export interface CommissionRequest {
  id: string
  operator_id: string
  operator_name?: string
  current_rate: number
  requested_rate: number
  justification: string
  status: "pending" | "approved" | "rejected"
  created_at: string
  updated_at: string
  reviewed_by?: string
  review_notes?: string
}

export async function createCommissionRequest(requestData: {
  requested_rate: number
  justification: string
}) {
  const supabase = createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: "User not authenticated" }
    }

    // Get current operator profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("commission_rate")
      .eq("id", user.id)
      .eq("role", "operator")
      .single()

    if (profileError) throw profileError

    const currentRate = profile?.commission_rate || 0.15 // Default 15%

    // Create commission request
    const { data, error } = await supabase
      .from("commission_requests")
      .insert({
        operator_id: user.id,
        current_rate: currentRate,
        requested_rate: requestData.requested_rate,
        justification: requestData.justification,
        status: "pending",
      })
      .select()
      .single()

    if (error) throw error

    revalidatePath("/dashboard/operator/commission-request")
    return { success: true, request: data }
  } catch (error) {
    console.error("Error creating commission request:", error)
    return { success: false, error: "Failed to create commission request" }
  }
}

export async function getCommissionRequests() {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from("commission_requests")
      .select(`
        *,
        operator:profiles!commission_requests_operator_id_fkey(stage_name, avatar_url)
      `)
      .order("created_at", { ascending: false })

    if (error) throw error

    return (data || []).map((request) => ({
      ...request,
      operator_name: request.operator?.stage_name || "Unknown Operator",
    }))
  } catch (error) {
    console.error("Error fetching commission requests:", error)
    return []
  }
}

export async function updateCommissionRequestStatus(
  requestId: string,
  status: "approved" | "rejected",
  reviewNotes?: string,
) {
  const supabase = createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: "User not authenticated" }
    }

    // Get the request details
    const { data: request, error: requestError } = await supabase
      .from("commission_requests")
      .select("*")
      .eq("id", requestId)
      .single()

    if (requestError || !request) {
      return { success: false, error: "Commission request not found" }
    }

    // Update request status
    const { error } = await supabase
      .from("commission_requests")
      .update({
        status,
        reviewed_by: user.id,
        review_notes: reviewNotes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", requestId)

    if (error) throw error

    // If approved, update operator's commission rate
    if (status === "approved") {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          commission_rate: request.requested_rate,
          updated_at: new Date().toISOString(),
        })
        .eq("id", request.operator_id)

      if (updateError) throw updateError
    }

    revalidatePath("/admin/commission-requests")
    return { success: true }
  } catch (error) {
    console.error("Error updating commission request status:", error)
    return { success: false, error: "Failed to update commission request status" }
  }
}

export async function getOperatorCommissionRequests(operatorId?: string) {
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
      .from("commission_requests")
      .select("*")
      .eq("operator_id", userId)
      .order("created_at", { ascending: false })

    if (error) throw error

    return data || []
  } catch (error) {
    console.error("Error fetching operator commission requests:", error)
    return []
  }
}
