"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const PromotionSchema = z.object({
  title: z.string().min(1, "Il titolo è obbligatorio."),
  description: z.string().optional(),
  special_price: z.coerce.number().min(0, "Il prezzo speciale non può essere negativo."),
  original_price: z.coerce.number().min(0, "Il prezzo originale non può essere negativo."),
  start_date: z.string().min(1, "La data di inizio è obbligatoria."),
  end_date: z.string().min(1, "La data di fine è obbligatoria."),
  valid_days: z.array(z.string()).min(1, "Seleziona almeno un giorno."),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  is_active: z.boolean(),
})

export async function getPromotions() {
  const supabase = createClient()
  const { data, error } = await supabase.from("promotions").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching promotions:", error)
    return []
  }
  return data
}

export async function createPromotion(formData: FormData) {
  const supabase = createClient()
  const rawData = Object.fromEntries(formData.entries())

  // Manual type conversion for zod
  rawData.special_price = Number.parseFloat(rawData.special_price as string)
  rawData.original_price = Number.parseFloat(rawData.original_price as string)
  rawData.is_active = rawData.is_active === "on"
  rawData.valid_days = formData.getAll("valid_days")

  const validatedFields = PromotionSchema.safeParse(rawData)

  if (!validatedFields.success) {
    return {
      error: "Dati non validi.",
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { data, error } = await supabase.from("promotions").insert([validatedFields.data]).select()

  if (error) {
    console.error("Error creating promotion:", error)
    return { error: "Impossibile creare la promozione." }
  }

  revalidatePath("/admin/promotions")
  return { success: "Promozione creata con successo.", data: data[0] }
}

export async function updatePromotion(id: string, formData: FormData) {
  const supabase = createClient()
  const rawData = Object.fromEntries(formData.entries())

  rawData.special_price = Number.parseFloat(rawData.special_price as string)
  rawData.original_price = Number.parseFloat(rawData.original_price as string)
  rawData.is_active = rawData.is_active === "on"
  rawData.valid_days = formData.getAll("valid_days")

  const validatedFields = PromotionSchema.safeParse(rawData)

  if (!validatedFields.success) {
    return {
      error: "Dati non validi per l'aggiornamento.",
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { error } = await supabase.from("promotions").update(validatedFields.data).eq("id", id)

  if (error) {
    console.error("Error updating promotion:", error)
    return { error: "Impossibile aggiornare la promozione." }
  }

  revalidatePath("/admin/promotions")
  return { success: "Promozione aggiornata con successo." }
}

export async function deletePromotion(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from("promotions").delete().eq("id", id)

  if (error) {
    console.error("Error deleting promotion:", error)
    return { error: "Impossibile eliminare la promozione." }
  }

  revalidatePath("/admin/promotions")
  return { success: "Promozione eliminata con successo." }
}
