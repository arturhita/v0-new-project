"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { Promotion } from "@/lib/promotions" // Assumendo che il tipo sia definito qui

export async function getPromotions() {
  const supabase = createClient()
  const { data, error } = await supabase.rpc("get_all_promotions")
  if (error) {
    console.error("Error fetching promotions:", error)
    return []
  }
  return data
}

export async function createPromotion(promotionData: Omit<Promotion, "id" | "created_at">) {
  const supabase = createClient()
  const { data, error } = await supabase.from("promotions").insert([promotionData]).select().single()

  if (error) {
    console.error("Error creating promotion:", error)
    return { success: false, message: error.message }
  }
  revalidatePath("/admin/promotions")
  return { success: true, message: "Promozione creata con successo!", data }
}

export async function updatePromotion(id: string, promotionData: Partial<Promotion>) {
  const supabase = createClient()
  const { data, error } = await supabase.from("promotions").update(promotionData).eq("id", id).select().single()

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
