"use server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import createServerClient from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getOperatorById(id: string) {
  const { data, error } = await supabaseAdmin.from("profiles").select("*").eq("id", id).single()
  if (error) return null
  return data
}

export async function registerOperator(userId: string, operatorData: any) {
  const { error } = await supabaseAdmin
    .from("profiles")
    .update({ ...operatorData, role: "operator" })
    .eq("id", userId)
  if (error) return { error: error.message }
  return { success: true }
}

export async function getAllOperators() {
  const { data, error } = await supabaseAdmin.from("profiles").select("*").eq("role", "operator")
  if (error) return []
  return data
}

export async function getOperatorPublicProfile(operatorName: string) {
  const supabase = await createServerClient()
  const { data, error } = await supabase.rpc("get_operator_profile_by_name", { p_operator_name: operatorName }).single()
  if (error) {
    console.error("Error fetching operator public profile:", error)
    return null
  }
  return data
}

export async function createOperator(operatorData: any) {
  const { error } = await supabaseAdmin.auth.admin.createUser({
    email: operatorData.email,
    password: operatorData.password,
    email_confirm: true,
    user_metadata: {
      full_name: operatorData.full_name,
      role: "operator",
    },
  })
  if (error) return { error: error.message }
  revalidatePath("/admin/operators")
  return { success: true }
}

export async function updateOperatorDetails(operatorId: string, details: any) {
  const { error } = await supabaseAdmin.from("profiles").update(details).eq("id", operatorId)
  if (error) return { error: error.message }
  revalidatePath(`/admin/operators/${operatorId}/edit`)
  return { success: true }
}

export async function updateOperatorCommission(operatorId: string, commission: number) {
  const { error } = await supabaseAdmin.from("profiles").update({ commission_rate: commission }).eq("id", operatorId)
  if (error) return { error: error.message }
  revalidatePath(`/admin/operators/${operatorId}/edit`)
  return { success: true }
}

export async function getOperatorForAdmin(operatorId: string) {
  const { data, error } = await supabaseAdmin.from("profiles").select("*").eq("id", operatorId).single()
  if (error) {
    console.error("Error fetching operator for admin:", error)
    return null
  }
  return data
}
