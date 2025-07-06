"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import type { UserProfile } from "@/types/user.types"

// Schema di validazione per i dati del profilo operatore
const operatorProfileSchema = z.object({
  name: z.string().min(2, "Il nome è obbligatorio."),
  surname: z.string().min(2, "Il cognome è obbligatorio."),
  stageName: z.string().min(2, "Il nome d'arte è obbligatorio."),
  phone: z.string().optional(),
  bio: z.string().max(1000, "La biografia è troppo lunga.").optional(),
  specialties: z.preprocess((val) => {
    if (typeof val === "string" && val) {
      return val
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    }
    if (Array.isArray(val)) {
      return val.map((s) => String(s).trim()).filter(Boolean)
    }
    return []
  }, z.array(z.string()).optional()),
})

export async function updateOperatorProfile(prevState: any, formData: FormData) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, message: "Utente non autenticato. Effettua nuovamente il login." }
  }

  const rawData = {
    name: formData.get("name"),
    surname: formData.get("surname"),
    stageName: formData.get("stageName"),
    phone: formData.get("phone"),
    bio: formData.get("bio"),
    specialties: formData.get("specialties"),
  }

  const validated = operatorProfileSchema.safeParse(rawData)

  if (!validated.success) {
    const errors = validated.error.flatten().fieldErrors
    console.error("Validation failed:", errors)
    const firstError = Object.values(errors)[0]?.[0] || "Dati non validi."
    return { success: false, message: firstError }
  }

  const { name, surname, stageName, phone, bio, specialties } = validated.data

  // 1. Aggiorna i dati testuali del profilo
  const { error: profileUpdateError } = await supabase
    .from("profiles")
    .update({
      name,
      surname,
      nickname: stageName, // Usiamo nickname per il nome d'arte
      phone,
      bio,
      specialties,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)

  if (profileUpdateError) {
    console.error("Errore aggiornamento profilo:", profileUpdateError)
    return {
      success: false,
      message: "Errore durante l'aggiornamento del profilo. Potrebbe essere un problema di permessi.",
    }
  }

  // 2. Gestisce il caricamento dell'avatar, se fornito
  const avatarFile = formData.get("avatar") as File
  if (avatarFile && avatarFile.size > 0) {
    const fileExt = avatarFile.name.split(".").pop()
    const filePath = `${user.id}/avatar.${fileExt}`

    const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, avatarFile, { upsert: true }) // upsert: true sovrascrive se esiste già

    if (uploadError) {
      console.error("Errore caricamento avatar:", uploadError)
      return { success: false, message: "Impossibile caricare l'avatar. Controlla i permessi dello storage." }
    }

    // Ottieni l'URL pubblico e aggiungi un timestamp per evitare problemi di cache del browser
    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(filePath)
    const finalUrl = `${publicUrl}?t=${new Date().getTime()}`

    const { error: dbError } = await supabase.from("profiles").update({ avatar_url: finalUrl }).eq("id", user.id)
    if (dbError) {
      console.error("Errore salvataggio URL avatar:", dbError)
      return { success: false, message: "Impossibile salvare il nuovo avatar nel profilo." }
    }
  }

  // La logica per la "storia" andrebbe qui, simile a quella dell'avatar

  revalidatePath("/(platform)/profile/operator")
  revalidatePath("/(platform)/esperti")
  revalidatePath(`/esperti/${user.id}`)
  return { success: true, message: "Il tuo Altare è stato aggiornato con successo!" }
}

// Le altre funzioni rimangono invariate
export async function getAllOperators(): Promise<UserProfile[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("profiles")
    .select(
      `
     id,
     name,
     nickname,
     avatar_url,
     bio,
     is_online,
     specialties,
     services
   `,
    )
    .eq("role", "operator")
    .eq("status", "approved") // Mostriamo solo gli operatori approvati

  if (error) {
    console.error("Error fetching operators:", error)
    return []
  }

  return data as UserProfile[]
}

export async function getOperatorById(id: string): Promise<{ data: UserProfile | null; error: any }> {
  const supabase = createClient()

  // Validazione base dell'ID per evitare errori noti
  if (!id || id.length < 36) {
    return { data: null, error: { message: "ID operatore non valido." } }
  }

  const { data, error } = await supabase.from("profiles").select("*").eq("id", id).eq("role", "operator").single() // .single() è più efficiente e restituisce un oggetto o un errore se non trova nulla

  if (error) {
    console.error(`Error fetching operator by id (${id}):`, error)
    return { data: null, error: { message: "Impossibile caricare l'operatore." } }
  }

  return { data: data as UserProfile, error: null }
}
