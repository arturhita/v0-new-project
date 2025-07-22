"use server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateCommissionRequestStatus(id: string, status: "approved" | "rejected", admin_notes?: string) {
  const { error } = await supabaseAdmin
    .from("commission_requests")
    .update({ status, admin_notes, processed_at: new Date().toISOString() })
    .eq("id", id)

  if (error) return { error: error.message }
  revalidatePath("/admin/commission-requests-log")
  return { success: true }
}

export async function getAllCommissionRequests() {
  const { data, error } = await supabaseAdmin
    .from("commission_requests")
    .select("*, profile:profiles(full_name)")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching commission requests:", error)
    return []
  }
  return data
}

export async function submitCommissionRequest(formData: FormData) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const rawData = {
    requested_rate: formData.get("requested_rate"),
    justification: formData.get("justification"),
  }

  if (!rawData.requested_rate || !rawData.justification) {
    return { error: "All fields are required." }
  }

  const { error } = await supabase.from("commission_requests").insert({
    operator_id: user.id,
    requested_rate: Number(rawData.requested_rate),
    justification: rawData.justification as string,
    status: "pending",
  })

  if (error) return { error: error.message }
  revalidatePath("/dashboard/operator/commission-request")
  return { success: "Request submitted." }
}

export async function getCommissionRequestsForOperator() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from("commission_requests")
    .select("*")
    .eq("operator_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching operator commission requests:", error)
    return []
  }
  return data
}
