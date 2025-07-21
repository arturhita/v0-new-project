"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function submitCommissionRequest(requestData: {
  requestedRate: number
  justification: string
}) {
  const supabase = createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("User not authenticated")

    const { data, error } = await supabase
      .from("commission_requests")
      .insert({
        operator_id: user.id,
        requested_rate: requestData.requestedRate,
        justification: requestData.justification,
        status: "pending",
      })
      .select()
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error("Error submitting commission request:", error)
    return { success: false, error: "Failed to submit request" }
  }
}

export async function getAllCommissionRequests() {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("commission_requests")
    .select(`
      *,
      operator:profiles!commission_requests_operator_id_fkey(stage_name, full_name)
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching commission requests:", error)
    return []
  }

  return data || []
}

export async function getCommissionRequestsForOperator(operatorId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("commission_requests")
    .select("*")
    .eq("operator_id", operatorId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching operator commission requests:", error)
    return []
  }

  return data || []
}

export async function updateCommissionRequestStatus(
  requestId: string,
  status: "approved" | "rejected",
  adminNotes?: string,
) {
  const supabase = createAdminClient()

  try {
    const { data, error } = await supabase
      .from("commission_requests")
      .update({
        status,
        admin_notes: adminNotes,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", requestId)
      .select()
      .single()

    if (error) throw error

    // If approved, update the operator's commission rate
    if (status === "approved") {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          commission_rate: data.requested_rate,
        })
        .eq("id", data.operator_id)

      if (updateError) throw updateError
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error updating commission request:", error)
    return { success: false, error: "Failed to update request" }
  }
}
