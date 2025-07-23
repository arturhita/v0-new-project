"use server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function createOrUpdatePromotion(promotionData: any) {
  const supabase = createAdminClient()
  const { id, ...updateData } = promotionData
  if (id) {
    const { data, error } = await supabase.from("promotions").update(updateData).eq("id", id).select().single()
    if (error) throw error
    return data
  } else {
    const { data, error } = await supabase.from("promotions").insert(updateData).select().single()
    if (error) throw error
    return data
  }
}

export async function getCurrentPromotionPrice(code: string) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("promotions")
    .select("price")
    .eq("code", code)
    .eq("is_active", true)
    .single()

  if (error || !data) {
    return null
  }
  return data.price
}

export async function getPromotions() {
  const supabase = createAdminClient()
  const { data, error } = await supabase.from("promotions").select("*")
  if (error) throw error
  return data
}

export async function deletePromotion(id: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from("promotions").delete().eq("id", id)
  if (error) throw error
}

export async function togglePromotionStatus(id: string, currentStatus: boolean) {
  const supabase = createAdminClient()
  const { error } = await supabase.from("promotions").update({ is_active: !currentStatus }).eq("id", id)
  if (error) throw error
}
