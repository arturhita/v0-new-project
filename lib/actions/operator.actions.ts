"use server"
import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export async function getOperatorById(id: string) {
  const supabase = createClient()
  const { data, error } = await supabase.from("profiles").select("*").eq("id", id).eq("role", "operator").single()

  if (error) {
    console.error("Error fetching operator by ID:", error)
    return null
  }
  return data
}

export async function registerOperator(formData: FormData) {
  // This is part of the auth flow now, see auth.actions.ts
  // This function can be used for post-registration profile updates
  console.log("Operator registration/profile update logic here.")
}

export async function getAllOperators() {
  const { data, error } = await supabaseAdmin.from("profiles").select("*").eq("role", "operator")

  if (error) {
    console.error("Error fetching all operators for admin:", error)
    return []
  }
  return data
}

export async function getOperatorPublicProfile(operatorName: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("profiles")
    .select(`
            id,
            full_name,
            avatar_url,
            bio,
            specialties,
            services,
            reviews ( id, rating, comment, created_at, client:profiles(full_name) )
        `)
    .eq("full_name", operatorName)
    .eq("role", "operator")
    .single()

  if (error) {
    console.error("Error fetching operator public profile:", error)
    return null
  }
  return data
}

export async function createOperator(formData: FormData) {
  // This is handled by auth.actions.ts signUpAsOperator
  console.log("Use signUpAsOperator for creation.")
}

export async function updateOperatorDetails(operatorId: string, updates: any) {
  const { error } = await supabaseAdmin.from("profiles").update(updates).eq("id", operatorId)

  if (error) return { error: error.message }
  revalidatePath(`/admin/operators/${operatorId}/edit`)
  revalidatePath("/admin/operators")
  return { success: true }
}

export async function updateOperatorCommission(operatorId: string, newCommission: number) {
  const { error } = await supabaseAdmin
    .from("operator_settings")
    .update({ commission_rate: newCommission })
    .eq("user_id", operatorId)

  if (error) return { error: error.message }
  revalidatePath(`/admin/operators/${operatorId}/edit`)
  return { success: true }
}

export async function getOperatorForAdmin(operatorId: string) {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("*, operator_settings(*)")
    .eq("id", operatorId)
    .single()

  if (error) {
    console.error("Error fetching operator for admin:", error)
    return null
  }
  return data
}
