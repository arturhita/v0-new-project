"use server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getPromotions() {
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase.from("promotions").select("*")
  if (error) {
    console.error("Error fetching promotions:", error)
    return { promotions: [], error: error.message }
  }
  return { promotions: data, error: null }
}

export async function createPromotion(formData: FormData) {
  const supabase = createSupabaseServerClient()
  const promotionData = {
    code: formData.get("code") as string,
    description: formData.get("description") as string,
    discount_type: formData.get("discount_type") as "percentage" | "fixed",
    discount_value: Number(formData.get("discount_value")),
    start_date: formData.get("start_date") as string,
    end_date: formData.get("end_date") as string,
    is_active: formData.get("is_active") === "on",
  }

  // Basic validation
  if (!promotionData.code || !promotionData.discount_value) {
    return { success: false, error: "Code and discount value are required." }
  }

  const { error } = await supabase.from("promotions").insert(promotionData)

  if (error) {
    console.error("Error creating promotion:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/admin/promotions")
  revalidatePath("/admin/dashboard")
  return { success: true, error: null }
}
