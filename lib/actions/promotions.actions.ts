"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import type { Promotion } from "@/types/promotion.types"

// Schema for validation
const PromotionSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, "Il titolo è obbligatorio."),
  description: z.string().optional(),
  specialPrice: z.number().positive("Il prezzo speciale deve essere positivo."),
  originalPrice: z.number().positive("Il prezzo originale deve essere positivo."),
  discountPercentage: z.number().int().min(0).max(100),
  validDays: z.array(z.string()).min(1, "Seleziona almeno un giorno."),
  startDate: z.string().min(1, "La data di inizio è obbligatoria."),
  endDate: z.string().min(1, "La data di fine è obbligatoria."),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  isActive: z.boolean(),
})

// Map database snake_case to JS camelCase
const mapToCamelCase = (p: any): Promotion => ({
  id: p.id,
  title: p.title,
  description: p.description,
  specialPrice: p.special_price,
  originalPrice: p.original_price,
  discountPercentage: p.discount_percentage,
  validDays: p.valid_days,
  startDate: p.start_date,
  endDate: p.end_date,
  startTime: p.start_time,
  endTime: p.end_time,
  isActive: p.is_active,
  createdAt: p.created_at,
  updatedAt: p.updated_at,
})

// Map JS camelCase to database snake_case
const mapToSnakeCase = (p: any) => ({
  title: p.title,
  description: p.description,
  special_price: p.specialPrice,
  original_price: p.originalPrice,
  discount_percentage: p.discountPercentage,
  valid_days: p.validDays,
  start_date: p.startDate,
  end_date: p.endDate,
  start_time: p.startTime || null,
  end_time: p.endTime || null,
  is_active: p.isActive,
})

export async function getPromotions(): Promise<Promotion[]> {
  const supabase = createClient()
  const { data, error } = await supabase.from("promotions").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching promotions:", error)
    return []
  }

  return data.map(mapToCamelCase)
}

export async function createOrUpdatePromotion(formData: Omit<Promotion, "createdAt" | "updatedAt">) {
  const validatedFields = PromotionSchema.safeParse(formData)

  if (!validatedFields.success) {
    return { success: false, error: "Dati non validi.", details: validatedFields.error.flatten().fieldErrors }
  }

  const supabase = createClient()
  const dbData = mapToSnakeCase(validatedFields.data)

  if (formData.id) {
    // Update
    const { data, error } = await supabase.from("promotions").update(dbData).eq("id", formData.id).select().single()
    if (error) {
      console.error("Error updating promotion:", error)
      return { success: false, error: "Impossibile aggiornare la promozione." }
    }
    revalidatePath("/admin/promotions")
    revalidatePath("/")
    return { success: true, data: mapToCamelCase(data) }
  } else {
    // Create
    const { data, error } = await supabase.from("promotions").insert(dbData).select().single()
    if (error) {
      console.error("Error creating promotion:", error)
      return { success: false, error: "Impossibile creare la promozione." }
    }
    revalidatePath("/admin/promotions")
    revalidatePath("/")
    return { success: true, data: mapToCamelCase(data) }
  }
}

export async function deletePromotion(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from("promotions").delete().eq("id", id)

  if (error) {
    console.error("Error deleting promotion:", error)
    return { success: false, error: "Impossibile eliminare la promozione." }
  }

  revalidatePath("/admin/promotions")
  revalidatePath("/")
  return { success: true }
}

export async function togglePromotionStatus(id: string, currentStatus: boolean) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("promotions")
    .update({ is_active: !currentStatus })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error toggling promotion status:", error)
    return { success: false, error: "Impossibile aggiornare lo stato." }
  }

  revalidatePath("/admin/promotions")
  revalidatePath("/")
  return { success: true, data: mapToCamelCase(data) }
}

export async function getCurrentPromotionPrice(): Promise<number | null> {
  const supabase = createClient()
  const now = new Date()
  const today = now.toISOString().split("T")[0]
  const currentTime = now.toTimeString().split(" ")[0]
  const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
  const currentDay = dayNames[now.getDay()]

  const { data, error } = await supabase
    .from("promotions")
    .select("special_price")
    .eq("is_active", true)
    .lte("start_date", today)
    .gte("end_date", today)
    .filter("valid_days", "cs", `{${currentDay}}`)
    .or(`start_time.is.null,start_time.lte.${currentTime}`)
    .or(`end_time.is.null,end_time.gte.${currentTime}`)
    .order("special_price", { ascending: true })
    .limit(1)
    .single()

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching active promotion price:", error)
    return null
  }

  return data ? data.special_price : null
}
