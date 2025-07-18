"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const PromotionSchema = z
  .object({
    id: z.string().uuid().optional(),
    title: z.string().min(1, "Il titolo è obbligatorio."),
    description: z.string().optional(),
    special_price: z.coerce.number().positive().optional(),
    discount_percentage: z.coerce.number().int().min(1).max(100).optional(),
    start_date: z.string().min(1, "La data di inizio è obbligatoria."),
    end_date: z.string().min(1, "La data di fine è obbligatoria."),
    is_active: z.boolean(),
  })
  .refine((data) => data.special_price != null || data.discount_percentage != null, {
    message: "Devi specificare un prezzo speciale o una percentuale di sconto.",
    path: ["special_price"],
  })

export async function getPromotions() {
  const supabase = createAdminClient()
  const { data, error } = await supabase.from("promotions").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching promotions:", error)
    throw new Error("Impossibile caricare le promozioni.")
  }
  return data
}

export async function savePromotion(formData: FormData) {
  const supabase = createAdminClient()

  const rawData = Object.fromEntries(formData.entries())

  // Convert checkbox value
  rawData.is_active = rawData.is_active === "on"

  // Clean up empty values for validation
  if (rawData.special_price === "") delete rawData.special_price
  if (rawData.discount_percentage === "") delete rawData.discount_percentage

  const validation = PromotionSchema.safeParse(rawData)

  if (!validation.success) {
    console.error("Validation errors:", validation.error.flatten().fieldErrors)
    return {
      error: "Dati non validi.",
      fieldErrors: validation.error.flatten().fieldErrors,
    }
  }

  const { id, ...promoData } = validation.data

  const dataToUpsert = {
    ...promoData,
    special_price: promoData.special_price || null,
    discount_percentage: promoData.discount_percentage || null,
  }

  if (id) {
    // Update
    const { error } = await supabase.from("promotions").update(dataToUpsert).eq("id", id)
    if (error) {
      console.error("Error updating promotion:", error)
      return { error: "Impossibile aggiornare la promozione." }
    }
  } else {
    // Create
    const { error } = await supabase.from("promotions").insert(dataToUpsert)
    if (error) {
      console.error("Error creating promotion:", error)
      return { error: "Impossibile creare la promozione." }
    }
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
