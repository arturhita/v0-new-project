"use server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import createServerClient from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateCommissionRequestStatus(requestId: string, status: "approved" | "rejected") {
  const { error } = await supabaseAdmin.from("commission_requests").update({ status }).eq("id", requestId)
  if (error) return { error: error.message }
  revalidatePath("/admin/commission-requests-log")
  return { success: true }
}

export async function getAllCommissionRequests() {
  const { data, error } = await supabaseAdmin.from("commission_requests").select("*, profiles(full_name)")
  if (error) return []
  return data
}

export async function submitCommissionRequest(requestData: { amount: number; details: string }) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const { error } = await supabase
    .from("commission_requests")
    .insert({ ...requestData, operator_id: user.id, status: "pending" })
  if (error) return { error: error.message }
  revalidatePath("/dashboard/operator/commission-request")
  return { success: true }
}

export async function getCommissionRequestsForOperator() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []
  const { data, error } = await supabase.from("commission_requests").select("*").eq("operator_id", user.id)
  if (error) return []
  return data
}
