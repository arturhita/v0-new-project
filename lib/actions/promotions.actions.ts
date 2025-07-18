"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getPromotions() {
  const supabase = createServerClient()
  const { data, error } = await supabase.from("promotions").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching promotions:", error)
    return []
  }
  return data
}

export async function createOrUpdatePromotion(formData: FormData) {
  const supabase = createServerClient()
  const id = formData.get("id") as string | null

  const specialPrice = formData.get("special_price") as string
  const discountPercentage = formData.get("discount_percentage") as string

  const promotionData = {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    start_date: formData.get("start_date") as string,
    end_date: formData.get("end_date") as string,
    is_active: formData.get("is_active") === "on",
    special_price: specialPrice ? Number.parseFloat(specialPrice) : null,
    discount_percentage: discountPercentage ? Number.parseInt(discountPercentage, 10) : null,
  }

  let error

  if (id) {
    const { error: updateError } = await supabase.from("promotions").update(promotionData).eq("id", id)
    error = updateError
  } else {
    const { error: insertError } = await supabase.from("promotions").insert(promotionData)
    error = insertError
  }

  if (error) {
    console.error("Error saving promotion:", error)
    return { success: false, message: error.message }
  }

  revalidatePath("/admin/promotions")
  return { success: true, message: "Promozione salvata con successo." }
}

export async function deletePromotion(id: string) {
  const supabase = createServerClient()
  const { error } = await supabase.from("promotions").delete().eq("id", id)

  if (error) {
    console.error("Error deleting promotion:", error)
    return { success: false, message: error.message }
  }

  revalidatePath("/admin/promotions")
  return { success: true, message: "Promozione eliminata." }
}
