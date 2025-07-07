"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const ProfileSchema = z.object({
  stage_name: z.string().min(2, "Il nome d'arte è obbligatorio."),
  headline: z.string().min(10, "La headline deve avere almeno 10 caratteri."),
  bio: z.string().min(50, "La biografia deve avere almeno 50 caratteri."),
  main_discipline: z.string().min(1, "Seleziona una disciplina principale."),
  specialties: z.array(z.string()).min(1, "Seleziona almeno una specialità."),
  chat_price_per_minute: z.coerce.number().min(0.5, "Il prezzo minimo è 0.50€."),
  call_price_per_minute: z.coerce.number().min(0.5, "Il prezzo minimo è 0.50€."),
  video_price_per_minute: z.coerce.number().min(0.5, "Il prezzo minimo è 0.50€."),
})

export async function updateOperatorProfile(prevState: any, formData: FormData) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, message: "Utente non autenticato." }
  }

  const validatedFields = ProfileSchema.safeParse({
    stage_name: formData.get("stage_name"),
    headline: formData.get("headline"),
    bio: formData.get("bio"),
    main_discipline: formData.get("main_discipline"),
    specialties: formData.getAll("specialties"),
    chat_price_per_minute: formData.get("chat_price_per_minute"),
    call_price_per_minute: formData.get("call_price_per_minute"),
    video_price_per_minute: formData.get("video_price_per_minute"),
  })

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Dati non validi.",
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      ...validatedFields.data,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)

  if (error) {
    console.error("Error updating profile:", error)
    return { success: false, message: `Errore durante l'aggiornamento del profilo: ${error.message}` }
  }

  revalidatePath("/(platform)/dashboard/operator/profile")
  return { success: true, message: "Profilo aggiornato con successo!" }
}

export async function toggleAvailability(is_available: boolean) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, message: "Utente non autenticato." }
  }

  const { error } = await supabase
    .from("profiles")
    .update({ is_available: is_available, updated_at: new Date().toISOString() })
    .eq("id", user.id)

  if (error) {
    console.error("Error toggling availability:", error)
    return { success: false, message: "Errore durante l'aggiornamento della disponibilità." }
  }

  revalidatePath("/(platform)/dashboard/operator")
  return { success: true, message: `Disponibilità aggiornata a: ${is_available ? "Disponibile" : "Non Disponibile"}` }
}
