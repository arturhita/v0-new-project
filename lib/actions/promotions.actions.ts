"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function createOrUpdatePromotion(promotionData: {
  id?: string
  title: string
  description: string
  discountType: "percentage" | "fixed"
  discountValue: number
  startDate: string
  endDate: string
  isActive: boolean
}) {
  const supabase = createAdminClient()

  try {
    if (promotionData.id) {
      // Update existing promotion
      const { data, error } = await supabase
        .from("promotions")
        .update({
          title: promotionData.title,
          description: promotionData.description,
          discount_type: promotionData.discountType,
          discount_value: promotionData.discountValue,
          start_date: promotionData.startDate,
          end_date: promotionData.endDate,
          is_active: promotionData.isActive,
          updated_at: new Date().toISOString(),
        })
        .eq("id", promotionData.id)
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } else {
      // Create new promotion
      const { data, error } = await supabase
        .from("promotions")
        .insert({
          title: promotionData.title,
          description: promotionData.description,
          discount_type: promotionData.discountType,
          discount_value: promotionData.discountValue,
          start_date: promotionData.startDate,
          end_date: promotionData.endDate,
          is_active: promotionData.isActive,
        })
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    }
  } catch (error) {
    console.error("Error creating/updating promotion:", error)
    return { success: false, error: "Failed to save promotion" }
  }
}

export async function getCurrentPromotionPrice(): Promise<number | null> {
  const supabase = createClient()

  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from("promotions")
    .select("discount_type, discount_value")
    .eq("is_active", true)
    .lte("start_date", now)
    .gte("end_date", now)
    .single()

  if (error || !data) {
    return null
  }

  // For simplicity, return the discount value as the promotional price
  // In a real system, you'd calculate this based on the original price
  return data.discount_value
}

export async function getPromotions() {
  const supabase = createClient()

  const { data, error } = await supabase.from("promotions").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching promotions:", error)
    return []
  }

  return data || []
}

export async function deletePromotion(promotionId: string) {
  const supabase = createAdminClient()

  try {
    const { error } = await supabase.from("promotions").delete().eq("id", promotionId)

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error("Error deleting promotion:", error)
    return { success: false, error: "Failed to delete promotion" }
  }
}

export async function togglePromotionStatus(promotionId: string, isActive: boolean) {
  const supabase = createAdminClient()

  try {
    const { data, error } = await supabase
      .from("promotions")
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString(),
      })
      .eq("id", promotionId)
      .select()
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error("Error toggling promotion status:", error)
    return { success: false, error: "Failed to update promotion status" }
  }
}
