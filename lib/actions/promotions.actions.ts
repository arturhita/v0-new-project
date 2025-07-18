"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// Definizione del tipo Promotion per coerenza
export interface Promotion {
  id: string
  title: string
  description?: string | null
  special_price: number
  original_price: number
  discount_percentage?: number | null
  start_date: string
  end_date: string
  valid_days: string[]
  is_active: boolean
  created_at: string
  updated_at?: string | null
}

type PromotionInput = Omit<Promotion, "id" | "created_at" | "updated_at">

export async function getPromotions(): Promise<Promotion[]> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc("get_all_promotions")
  if (error) {
    console.error("Error fetching promotions:", error)
    return []
  }
  return data as Promotion[]
}

export async function createPromotion(promotionData: PromotionInput) {
  const supabase = createClient()
  const { data, error } = await supabase.from("promotions").insert([promotionData]).select().single()

  if (error) {
    console.error("Error creating promotion:", error)
    return { success: false, message: error.message }
  }
  revalidatePath("/admin/promotions")
  return { success: true, message: "Promozione creata con successo!", data }
}

export async function updatePromotion(id: string, promotionData: Partial<PromotionInput>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("promotions")
    .update({ ...promotionData, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating promotion:", error)
    return { success: false, message: error.message }
  }
  revalidatePath("/admin/promotions")
  return { success: true, message: "Promozione aggiornata con successo!", data }
}

export async function deletePromotion(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from("promotions").delete().eq("id", id)

  if (error) {
    console.error("Error deleting promotion:", error)
    return { success: false, message: error.message }
  }
  revalidatePath("/admin/promotions")
  return { success: true, message: "Promozione eliminata con successo!" }
}
