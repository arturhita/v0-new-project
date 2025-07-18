"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import type { Promotion } from "@/lib/schemas"

export async function getPromotions() {
  const supabase = createAdminClient()
  const { data, error } = await supabase.from("promotions").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching promotions:", error)
    return []
  }
  return data
}

export async function createPromotion(promotionData: Omit<Promotion, "id" | "created_at">) {
  const supabase = createAdminClient()
  const { error } = await supabase.from("promotions").insert([promotionData])

  if (error) {
    console.error("Error creating promotion:", error)
    return { error: "Impossibile creare la promozione." }
  }

  revalidatePath("/admin/promotions")
  return { success: true }
}

export async function updatePromotion(id: string, promotionData: Partial<Promotion>) {
  const supabase = createAdminClient()
  const { error } = await supabase.from("promotions").update(promotionData).eq("id", id)

  if (error) {
    console.error("Error updating promotion:", error)
    return { error: "Impossibile aggiornare la promozione." }
  }

  revalidatePath("/admin/promotions")
  return { success: true }
}

export async function deletePromotion(id: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from("promotions").delete().eq("id", id)

  if (error) {
    console.error("Error deleting promotion:", error)
    return { error: "Impossibile eliminare la promozione." }
  }

  revalidatePath("/admin/promotions")
  return { success: true }
}
