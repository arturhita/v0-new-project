"use server"
import { createAdminClient } from "./supabase/admin"

export async function getOperatorById(id: string) {
  const supabase = createAdminClient()
  const { data, error } = await supabase.from("profiles").select("*").eq("id", id).single()
  if (error) throw error
  return data
}

export async function updateOperatorCommission(operatorId: string, newCommission: number) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("profiles")
    .update({ commission_rate: newCommission })
    .eq("id", operatorId)
  if (error) throw error
  return data
}

export async function updateOperatorProfile(operatorId: string, profileData: any) {
  const supabase = createAdminClient()
  const { data, error } = await supabase.from("profiles").update(profileData).eq("id", operatorId)
  if (error) throw error
  return data
}
