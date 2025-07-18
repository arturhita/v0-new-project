"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const PromotionSchema = z
  .object({
    id: z.string().uuid().optional().nullable(),
    title: z.string().min(1, "Il titolo è obbligatorio."),
    description: z.string().optional(),
    special_price: z.coerce.number().positive("Il prezzo deve essere positivo.").optional().nullable(),
    discount_percentage: z.coerce.number().int().min(1).max(100).optional().nullable(),
    start_date: z.string().min(1, "La data di inizio è obbligatoria."),
    end_date: z.string().min(1, "La data di fine è obbligatoria."),
    is_active: z.boolean(),
  })
  .refine((data) => data.special_price != null || data.discount_percentage != null, {
    message: "Devi specificare un prezzo speciale o una percentuale di sconto.",
    path: ["special_price"],
  })
  .refine((data) => !(data.special_price != null && data.discount_percentage != null), {
    message: "Non puoi specificare sia un prezzo speciale che uno sconto.",
    path: ["special_price"],
  })

export async function savePromotion(formData: FormData) {
  const supabase = createAdminClient()

  const rawData = {
    id: formData.get("id") || null,
    title: formData.get("title"),
    description: formData.get("description"),
    special_price: formData.get("special_price"),
    discount_percentage: formData.get("discount_percentage"),
    start_date: formData.get("start_date"),
    end_date: formData.get("end_date"),
    is_active: formData.get("is_active") === "on",
  }

  const validation = PromotionSchema.safeParse(rawData)

  if (!validation.success) {
    return {
      error: "Dati non validi.",
      fieldErrors: validation.error.flatten().fieldErrors,
    }
  }

  const { id, ...promoData } = validation.data

  if (id) {
    const { error } = await supabase.from("promotions").update(promoData).eq("id", id)
    if (error) return { error: "Impossibile aggiornare la promozione." }
  } else {
    const { error } = await supabase.from("promotions").insert(promoData)
    if (error) return { error: "Impossibile creare la promozione." }
  }

  revalidatePath("/admin/promotions")
  return { success: "Promozione salvata con successo." }
}

export async function deletePromotion(id: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from("promotions").delete().eq("id", id)
  if (error) return { error: "Impossibile eliminare la promozione." }
  revalidatePath("/admin/promotions")
  return { success: "Promozione eliminata con successo." }
}
