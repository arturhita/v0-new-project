"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { unstable_noStore as noStore } from "next/cache"

export async function getPromotions() {
  noStore()
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase.from("promotions").select("*").order("created_at", { ascending: false })
  if (error) return []
  return data
}

export async function createPromotion(formData: FormData) {
  const supabase = createSupabaseServerClient()
  const rawData = Object.fromEntries(formData.entries())

  const dataToInsert = {
    title: rawData.title as string,
    description: rawData.description as string,
    special_price: Number(rawData.special_price),
    original_price: Number(rawData.original_price),
    start_date: new Date(rawData.start_date as string).toISOString(),
    end_date: new Date(rawData.end_date as string).toISOString(),
    valid_days: formData.getAll("valid_days"),
    is_active: rawData.is_active === "on",
  }

  const { error } = await supabase.from("promotions").insert(dataToInsert)
  if (error) return { success: false, message: error.message }

  revalidatePath("/admin/promotions")
  return { success: true, message: "Promozione creata." }
}

// Aggiungere funzioni per update e delete
