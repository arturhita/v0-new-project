"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import type { Profile } from "@/types/database"

// ============================================================================
// PUBLIC-FACING ACTIONS (for homepage, category pages, etc.)
// ============================================================================

export async function getOperators(options?: { limit?: number; category?: string }): Promise<Profile[]> {
  const supabase = createClient()
  let query = supabase
    .from("profiles")
    .select(
      `
      id,
      full_name,
      stage_name,
      headline,
      is_available,
      is_online,
      profile_image_url,
      chat_price_per_minute,
      average_rating,
      main_discipline
    `,
    )
    .eq("role", "operator")
    .eq("status", "active")

  if (options?.category) {
    query = query.eq("main_discipline", options.category)
  }
  if (options?.limit) {
    query = query.limit(options.limit)
  }
  query = query
    .order("is_online", { ascending: false })
    .order("is_available", { ascending: false })
    .order("average_rating", { ascending: false, nullsFirst: false })

  const { data, error } = await query
  if (error) {
    console.error("Error fetching operators:", error.message)
    return []
  }
  return (data as Profile[]) || []
}

export async function getOperatorByStageName(stageName: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("profiles")
    .select(`*, reviews(*, client:client_id(full_name, avatar_url))`)
    .eq("stage_name", stageName)
    .eq("role", "operator")
    .single()

  if (error) {
    console.error("Error fetching operator by stage name:", error)
    return null
  }
  return data
}

// ============================================================================
// OPERATOR DASHBOARD ACTIONS
// ============================================================================

const ProfileSchema = z.object({
  stage_name: z.string().min(2, "Il nome d'arte è obbligatorio."),
  headline: z.string().min(10, "La headline deve avere almeno 10 caratteri.").max(100, "Massimo 100 caratteri."),
  bio: z.string().min(50, "La biografia deve avere almeno 50 caratteri."),
  main_discipline: z.string().min(1, "Seleziona una disciplina principale."),
  specialties: z.array(z.string()).min(1, "Seleziona almeno una specialità."),
  chat_price_per_minute: z.coerce.number().min(0.5, "Il prezzo minimo è 0.50€."),
  call_price_per_minute: z.coerce.number().min(0.5, "Il prezzo minimo è 0.50€."),
  video_price_per_minute: z.coerce.number().min(0.5, "Il prezzo minimo è 0.50€."),
})

export async function getOperatorPublicProfile(operatorId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "stage_name, headline, bio, main_discipline, specialties, profile_image_url, chat_price_per_minute, call_price_per_minute, video_price_per_minute",
    )
    .eq("id", operatorId)
    .single()

  if (error) {
    console.error("Error fetching operator public profile:", error)
    return null
  }
  return data
}

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
  revalidatePath(`/operator/${validatedFields.data.stage_name}`) // Revalidate public profile page
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
  revalidatePath("/")
  return { success: true, message: `Disponibilità aggiornata a: ${is_available ? "Disponibile" : "Non Disponibile"}` }
}
