"use server"

import { supabaseAdmin } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export async function createOrUpdatePromotion(promotionData: any) {
  const { id, ...updateData } = promotionData
  let result
  if (id) {
    result = await supabaseAdmin.from("promotions").update(updateData).eq("id", id)
  } else {
    result = await supabaseAdmin.from("promotions").insert(updateData)
  }

  if (result.error) {
    console.error("Error saving promotion:", result.error)
    return { error: result.error.message }
  }

  revalidatePath("/admin/promotions")
  return { success: true }
}

export async function getCurrentPromotionPrice() {
  const { data, error } = await supabaseAdmin
    .from("promotions")
    .select("promotional_price")
    .eq("is_active", true)
    .lt("start_date", new Date().toISOString())
    .gt("end_date", new Date().toISOString())
    .limit(1)
    .single()

  if (error || !data) {
    return null
  }
  return data.promotional_price
}

export async function getPromotions() {
  const { data, error } = await supabaseAdmin.from("promotions").select("*").order("created_at", { ascending: false })
  if (error) {
    console.error("Error fetching promotions:", error)
    return []
  }
  return data
}

export async function deletePromotion(promotionId: string) {
  const { error } = await supabaseAdmin.from("promotions").delete().eq("id", promotionId)
  if (error) {
    console.error("Error deleting promotion:", error)
    return { error: error.message }
  }
  revalidatePath("/admin/promotions")
  return { success: true }
}

export async function togglePromotionStatus(promotionId: string, currentStatus: boolean) {
  const { error } = await supabaseAdmin.from("promotions").update({ is_active: !currentStatus }).eq("id", promotionId)
  if (error) {
    console.error("Error toggling promotion status:", error)
    return { error: error.message }
  }
  revalidatePath("/admin/promotions")
  return { success: true }
}
