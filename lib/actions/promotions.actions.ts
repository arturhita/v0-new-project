"use server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import type { Promotion } from "@/types/promotion.types"
import { revalidatePath } from "next/cache"

export async function createOrUpdatePromotion(
  promotion: Omit<Promotion, "id" | "created_at" | "is_active"> & { id?: string },
) {
  const supabase = supabaseAdmin
  const { id, ...updateData } = promotion

  if (id) {
    const { data, error } = await supabase.from("promotions").update(updateData).eq("id", id).select().single()
    if (error) return { error: error.message }
    revalidatePath("/admin/promotions")
    return { data }
  } else {
    const { data, error } = await supabase.from("promotions").insert(updateData).select().single()
    if (error) return { error: error.message }
    revalidatePath("/admin/promotions")
    return { data }
  }
}

export async function getCurrentPromotionPrice(serviceType: "chat" | "call", basePrice: number): Promise<number> {
  const supabase = supabaseAdmin
  const now = new Date().toISOString()

  const { data: promotion, error } = await supabase
    .from("promotions")
    .select("discount_percentage")
    .eq("is_active", true)
    .or(`service_type.eq.all,service_type.eq.${serviceType}`)
    .lte("start_date", now)
    .gte("end_date", now)
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  if (error || !promotion) {
    return basePrice
  }

  return basePrice * (1 - promotion.discount_percentage / 100)
}

export async function getPromotions(): Promise<Promotion[]> {
  const supabase = supabaseAdmin
  const { data, error } = await supabase.from("promotions").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching promotions:", error)
    return []
  }
  return data || []
}

export async function deletePromotion(id: string) {
  const supabase = supabaseAdmin
  const { error } = await supabase.from("promotions").delete().eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/admin/promotions")
  return { success: true }
}

export async function togglePromotionStatus(id: string, currentState: boolean) {
  const supabase = supabaseAdmin
  const { error } = await supabase.from("promotions").update({ is_active: !currentState }).eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/admin/promotions")
  return { success: true }
}
