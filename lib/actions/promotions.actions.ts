"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export interface Promotion {
  id: string
  title: string
  description: string
  discount_type: "percentage" | "fixed_amount"
  discount_value: number
  min_purchase_amount?: number
  max_discount_amount?: number
  start_date: string
  end_date: string
  is_active: boolean
  usage_limit?: number
  used_count: number
  applicable_services: string[]
  created_at: string
  updated_at: string
}

export async function createPromotion(promotionData: {
  title: string
  description: string
  discount_type: "percentage" | "fixed_amount"
  discount_value: number
  min_purchase_amount?: number
  max_discount_amount?: number
  start_date: string
  end_date: string
  usage_limit?: number
  applicable_services: string[]
}) {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from("promotions")
      .insert({
        ...promotionData,
        is_active: true,
        used_count: 0,
      })
      .select()
      .single()

    if (error) throw error

    revalidatePath("/admin/promotions")
    return { success: true, promotion: data }
  } catch (error) {
    console.error("Error creating promotion:", error)
    return { success: false, error: "Failed to create promotion" }
  }
}

export async function getPromotions() {
  const supabase = createClient()

  try {
    const { data, error } = await supabase.from("promotions").select("*").order("created_at", { ascending: false })

    if (error) throw error

    return data || []
  } catch (error) {
    console.error("Error fetching promotions:", error)
    return []
  }
}

export async function getActivePromotions() {
  const supabase = createClient()

  try {
    const now = new Date().toISOString()

    const { data, error } = await supabase
      .from("promotions")
      .select("*")
      .eq("is_active", true)
      .lte("start_date", now)
      .gte("end_date", now)
      .order("created_at", { ascending: false })

    if (error) throw error

    return data || []
  } catch (error) {
    console.error("Error fetching active promotions:", error)
    return []
  }
}

export async function updatePromotionStatus(id: string, is_active: boolean) {
  const supabase = createClient()

  try {
    const { error } = await supabase
      .from("promotions")
      .update({
        is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (error) throw error

    revalidatePath("/admin/promotions")
    return { success: true }
  } catch (error) {
    console.error("Error updating promotion status:", error)
    return { success: false, error: "Failed to update promotion status" }
  }
}

export async function deletePromotion(id: string) {
  const supabase = createClient()

  try {
    const { error } = await supabase.from("promotions").delete().eq("id", id)

    if (error) throw error

    revalidatePath("/admin/promotions")
    return { success: true }
  } catch (error) {
    console.error("Error deleting promotion:", error)
    return { success: false, error: "Failed to delete promotion" }
  }
}

export async function getCurrentPromotionPrice(): Promise<number | null> {
  const supabase = createClient()

  try {
    const now = new Date().toISOString()

    const { data, error } = await supabase
      .from("promotions")
      .select("*")
      .eq("is_active", true)
      .lte("start_date", now)
      .gte("end_date", now)
      .contains("applicable_services", ["chat", "call"])
      .order("discount_value", { ascending: false })
      .limit(1)
      .single()

    if (error || !data) return null

    // Return the promotional price (assuming it's a fixed amount for simplicity)
    if (data.discount_type === "fixed_amount") {
      return data.discount_value
    }

    // For percentage discounts, we'd need a base price to calculate from
    // For now, return null to use regular pricing
    return null
  } catch (error) {
    console.error("Error getting current promotion price:", error)
    return null
  }
}

export async function applyPromotion(promotionId: string, orderAmount: number) {
  const supabase = createClient()

  try {
    const { data: promotion, error } = await supabase
      .from("promotions")
      .select("*")
      .eq("id", promotionId)
      .eq("is_active", true)
      .single()

    if (error || !promotion) {
      return { success: false, error: "Promotion not found or inactive" }
    }

    // Check if promotion is still valid
    const now = new Date()
    const startDate = new Date(promotion.start_date)
    const endDate = new Date(promotion.end_date)

    if (now < startDate || now > endDate) {
      return { success: false, error: "Promotion is not currently active" }
    }

    // Check usage limit
    if (promotion.usage_limit && promotion.used_count >= promotion.usage_limit) {
      return { success: false, error: "Promotion usage limit reached" }
    }

    // Check minimum purchase amount
    if (promotion.min_purchase_amount && orderAmount < promotion.min_purchase_amount) {
      return { success: false, error: `Minimum purchase amount of €${promotion.min_purchase_amount} required` }
    }

    // Calculate discount
    let discountAmount = 0
    if (promotion.discount_type === "percentage") {
      discountAmount = (orderAmount * promotion.discount_value) / 100
      if (promotion.max_discount_amount) {
        discountAmount = Math.min(discountAmount, promotion.max_discount_amount)
      }
    } else {
      discountAmount = promotion.discount_value
    }

    const finalAmount = Math.max(0, orderAmount - discountAmount)

    return {
      success: true,
      discountAmount,
      finalAmount,
      promotion,
    }
  } catch (error) {
    console.error("Error applying promotion:", error)
    return { success: false, error: "Failed to apply promotion" }
  }
}
