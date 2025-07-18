"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getPromotions() {
  const supabase = createClient()
  const { data, error } = await supabase.from("promotions").select("*")

  if (error) {
    console.error("Error fetching promotions:", error)
    return []
  }
  return data
}

export async function createPromotion(formData: FormData) {
  const supabase = createClient()

  const newPromotion = {
    code: formData.get("code") as string,
    description: formData.get("description") as string,
    discount_type: formData.get("discount_type") as "percentage" | "fixed",
    discount_value: Number(formData.get("discount_value")),
    start_date: formData.get("start_date") as string,
    end_date: formData.get("end_date") as string,
    is_active: formData.get("is_active") === "on",
  }

  const { error } = await supabase.from("promotions").insert(newPromotion)

  if (error) {
    console.error("Error creating promotion:", error)
    return { success: false, message: "Errore durante la creazione della promozione." }
  }

  revalidatePath("/admin/promotions")
  return { success: true, message: "Promozione creata con successo." }
}

export async function updatePromotion(promotionId: string, formData: FormData) {
  const supabase = createClient()

  const updatedPromotion = {
    code: formData.get("code") as string,
    description: formData.get("description") as string,
    discount_type: formData.get("discount_type") as "percentage" | "fixed",
    discount_value: Number(formData.get("discount_value")),
    start_date: formData.get("start_date") as string,
    end_date: formData.get("end_date") as string,
    is_active: formData.get("is_active") === "on",
  }

  const { error } = await supabase.from("promotions").update(updatedPromotion).eq("id", promotionId)

  if (error) {
    console.error("Error updating promotion:", error)
    return { success: false, message: "Errore durante l'aggiornamento della promozione." }
  }

  revalidatePath("/admin/promotions")
  return { success: true, message: "Promozione aggiornata con successo." }
}

export async function deletePromotion(promotionId: string) {
  const supabase = createClient()
  const { error } = await supabase.from("promotions").delete().eq("id", promotionId)

  if (error) {
    console.error("Error deleting promotion:", error)
    return { success: false, message: "Errore durante l'eliminazione della promozione." }
  }

  revalidatePath("/admin/promotions")
  return { success: true, message: "Promozione eliminata con successo." }
}
