"use server"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateCommissionRequestStatus(id: string, status: "approved" | "rejected") {
  const supabase = createAdminClient()
  const { error } = await supabase.from("commission_requests").update({ status }).eq("id", id)
  if (error) return { success: false, error }
  revalidatePath("/admin/commission-requests")
  return { success: true }
}

export async function getAllCommissionRequests() {
  const supabase = createAdminClient()
  const { data, error } = await supabase.from("commission_requests").select("*, profiles(full_name)")
  if (error) return []
  return data
}

export async function submitCommissionRequest(amount: number) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const adminSupabase = createAdminClient()
  const { error } = await adminSupabase.from("commission_requests").insert({ user_id: user.id, amount })
  if (error) return { success: false, error }
  revalidatePath("/dashboard/operator/commission-request")
  return { success: true }
}

export async function getCommissionRequestsForOperator() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const adminSupabase = createAdminClient()
  const { data, error } = await adminSupabase.from("commission_requests").select("*").eq("user_id", user.id)
  if (error) return []
  return data
}
