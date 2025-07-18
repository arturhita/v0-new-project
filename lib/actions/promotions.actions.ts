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

export async function savePromotion(id: string | null, formData: FormData) {
  const supabase = createAdminClient()

  const rawData = {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    special_price: formData.get("special_price") ? Number(formData.get("special_price")) : null,
    discount_percentage: formData.get("discount_percentage") ? Number(formData.get("discount_percentage")) : null,
    start_date: formData.get("start_date") as string,
    end_date: formData.get("end_date") as string,
    is_active: formData.get("is_active") === "on",
  }

  if (rawData.special_price === null && rawData.discount_percentage === null) {
    return { error: "Devi specificare un prezzo speciale o una percentuale di sconto." }
  }
  if (rawData.special_price !== null && rawData.discount_percentage !== null) {
    return { error: "Puoi specificare solo un prezzo speciale o una percentuale di sconto, non entrambi." }
  }

  let error
  if (id) {
    const { error: updateError } = await supabase.from("promotions").update(rawData).eq("id", id)
    error = updateError
  } else {
    const { error: insertError } = await supabase.from("promotions").insert([rawData])
    error = insertError
  }

  if (error) {
    console.error("Error saving promotion:", error)
    return { error: "Impossibile salvare la promozione." }
  }

  revalidatePath("/admin/promotions")
  return { success: `Promozione ${id ? "aggiornata" : "creata"} con successo.` }
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
