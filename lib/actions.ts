"use server"
import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export async function getOperatorById(id: string) {
  const supabase = createAdminClient()
  const { data, error } = await supabase.from("profiles").select("*").eq("id", id).single()
  if (error) {
    console.error("Error fetching operator by ID:", error)
    return null
  }
  return data
}

export async function updateOperatorCommission(operatorId: string, newCommission: number) {
  const supabase = createAdminClient()
  const { error } = await supabase.from("profiles").update({ commission_rate: newCommission }).eq("id", operatorId)
  if (error) return { success: false, error }
  revalidatePath(`/admin/operators/${operatorId}/edit`)
  return { success: true }
}

export async function updateOperatorProfile(operatorId: string, profileData: any) {
  const supabase = createAdminClient()
  const { error } = await supabase.from("profiles").update(profileData).eq("id", operatorId)
  if (error) return { success: false, error }
  revalidatePath(`/admin/operators/${operatorId}/edit`)
  revalidatePath(`/operator/${profileData.full_name}`)
  return { success: true }
}
