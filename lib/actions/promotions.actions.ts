"use server"
import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export async function createOrUpdatePromotion(promotionData: any) {
  const supabase = createAdminClient()
  const { id, ...updateData } = promotionData
  let result
  if (id) {
    result = await supabase.from("promotions").update(updateData).eq("id", id).select()
  } else {
    result = await supabase.from("promotions").insert(updateData).select()
  }

  if (result.error) {
    console.error("Error creating/updating promotion:", result.error)
    return { success: false, error: result.error }
  }
  revalidatePath("/admin/promotions")
  return { success: true, data: result.data }
}

export async function getCurrentPromotionPrice(serviceType: string, basePrice: number) {
  const supabase = createAdminClient()
  const { data: promotion, error } = await supabase
    .from("promotions")
    .select("discount_percentage")
    .eq("is_active", true)
    .or(`applicable_services.cs.{"${serviceType}"},applicable_services.cs.{"all"}`)
    .single()

  if (error || !promotion) {
    return basePrice
  }

  return basePrice * (1 - promotion.discount_percentage / 100)
}

export async function getPromotions() {
  const supabase = createAdminClient()
  const { data, error } = await supabase.from("promotions").select("*")
  if (error) {
    console.error("Error fetching promotions:", error)
    return []
  }
  return data
}

export async function deletePromotion(id: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from("promotions").delete().eq("id", id)
  if (error) {
    console.error("Error deleting promotion:", error)
    return { success: false, error }
  }
  revalidatePath("/admin/promotions")
  return { success: true }
}

export async function togglePromotionStatus(id: string, currentStatus: boolean) {
  const supabase = createAdminClient()
  const { error } = await supabase.from("promotions").update({ is_active: !currentStatus }).eq("id", id)
  if (error) {
    console.error("Error toggling promotion status:", error)
    return { success: false, error }
  }
  revalidatePath("/admin/promotions")
  return { success: true }
}
