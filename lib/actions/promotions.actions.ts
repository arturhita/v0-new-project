"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import { unstable_noStore as noStore } from "next/cache"

export async function getPromotions() {
  noStore()
  const supabase = createAdminClient()
  const { data, error } = await supabase.from("promotions").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching promotions:", error)
    return []
  }
  return data
}

export async function createOrUpdatePromotion(formData: FormData) {
  const supabase = createAdminClient()
  const rawData = {
    id: formData.get("id") as string | null,
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    special_price: formData.get("special_price") ? Number(formData.get("special_price")) : null,
    discount_percentage: formData.get("discount_percentage") ? Number(formData.get("discount_percentage")) : null,
    start_date: formData.get("start_date") as string,
    end_date: formData.get("end_date") as string,
    is_active: formData.get("is_active") === "on",
  }

  const { id, ...updateData } = rawData

  if (id) {
    // Update existing promotion
    const { error } = await supabase.from("promotions").update(updateData).eq("id", id)
    if (error) return { error: `Errore durante l'aggiornamento della promozione: ${error.message}` }
  } else {
    // Create new promotion
    const { error } = await supabase.from("promotions").insert(updateData)
    if (error) return { error: `Errore durante la creazione della promozione: ${error.message}` }
  }

  revalidatePath("/admin/promotions")
  return { success: "Promozione salvata con successo." }
}

export async function deletePromotion(id: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from("promotions").delete().eq("id", id)

  if (error) {
    return { error: `Errore durante l'eliminazione della promozione: ${error.message}` }
  }

  revalidatePath("/admin/promotions")
  return { success: "Promozione eliminata con successo." }
}
