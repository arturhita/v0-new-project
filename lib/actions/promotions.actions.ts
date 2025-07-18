"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getPromotions() {
  const supabase = createClient()
  const { data, error } = await supabase.from("promotions").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching promotions:", error)
    return []
  }
  return data
}

export async function createOrUpdatePromotion(formData: FormData) {
  const supabase = createClient()
  const id = formData.get("id") as string | null

  const promotionData = {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    discount_percentage: formData.get("discount_percentage") ? Number(formData.get("discount_percentage")) : null,
    special_price: formData.get("special_price") ? Number(formData.get("special_price")) : null,
    start_date: formData.get("start_date") as string,
    end_date: formData.get("end_date") as string,
    is_active: formData.get("is_active") === "on",
  }

  let response
  if (id) {
    response = await supabase.from("promotions").update(promotionData).eq("id", id)
  } else {
    response = await supabase.from("promotions").insert(promotionData)
  }

  if (response.error) {
    console.error("Error saving promotion:", response.error)
    return { success: false, message: "Errore durante il salvataggio della promozione." }
  }

  revalidatePath("/admin/promotions")
  return { success: true, message: "Promozione salvata con successo." }
}

export async function deletePromotion(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from("promotions").delete().eq("id", id)

  if (error) {
    console.error("Error deleting promotion:", error)
    return { success: false, message: "Errore durante l'eliminazione della promozione." }
  }

  revalidatePath("/admin/promotions")
  return { success: true, message: "Promozione eliminata con successo." }
}
