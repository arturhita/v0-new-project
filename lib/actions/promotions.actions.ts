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

export async function createPromotion(formData: FormData) {
  const supabase = createAdminClient()
  const rawData = {
    code: formData.get("code"),
    description: formData.get("description"),
    discount_percentage: Number(formData.get("discount_percentage")),
    start_date: formData.get("start_date"),
    end_date: formData.get("end_date"),
    is_active: formData.get("is_active") === "on",
  }

  const { error } = await supabase.from("promotions").insert([rawData])
  if (error) {
    return { error: "Impossibile creare la promozione." }
  }

  revalidatePath("/admin/promotions")
  return { success: "Promozione creata con successo." }
}

export async function updatePromotion(id: string, formData: FormData) {
  const supabase = createAdminClient()
  const rawData = {
    code: formData.get("code"),
    description: formData.get("description"),
    discount_percentage: Number(formData.get("discount_percentage")),
    start_date: formData.get("start_date"),
    end_date: formData.get("end_date"),
    is_active: formData.get("is_active") === "on",
  }

  const { error } = await supabase.from("promotions").update(rawData).eq("id", id)
  if (error) {
    return { error: "Impossibile aggiornare la promozione." }
  }

  revalidatePath("/admin/promotions")
  return { success: "Promozione aggiornata con successo." }
}

export async function deletePromotion(id: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from("promotions").delete().eq("id", id)
  if (error) {
    return { error: "Impossibile eliminare la promozione." }
  }
  revalidatePath("/admin/promotions")
  return { success: "Promozione eliminata con successo." }
}
