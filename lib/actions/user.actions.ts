"use server"

import { createServerClient } from "@/lib/supabase/server"
import { z } from "zod"
import { revalidatePath } from "next/cache"

const profileSchema = z.object({
  name: z.string().min(2, { message: "Il nome deve essere di almeno 2 caratteri." }),
  nickname: z
    .string()
    .min(2, { message: "Il nickname deve essere di almeno 2 caratteri." })
    .optional()
    .or(z.literal("")),
  bio: z.string().max(500, { message: "La biografia non può superare i 500 caratteri." }).optional().or(z.literal("")),
})

export async function getProfile() {
  const supabase = createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: { message: "Utente non autenticato." } }
  }

  const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (error) {
    console.error("Errore nel recuperare il profilo:", error)
    return { error: { message: "Impossibile caricare il profilo." } }
  }

  return { data }
}

export async function updateProfile(formData: FormData) {
  const supabase = createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, message: "Utente non autenticato." }
  }

  const rawData = {
    name: formData.get("name"),
    nickname: formData.get("nickname"),
    bio: formData.get("bio"),
  }

  const validated = profileSchema.safeParse(rawData)

  if (!validated.success) {
    return { success: false, message: validated.error.errors.map((e) => e.message).join(", ") }
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      name: validated.data.name,
      nickname: validated.data.nickname,
      bio: validated.data.bio,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)

  if (error) {
    console.error("Errore nell'aggiornare il profilo:", error)
    return { success: false, message: "Si è verificato un errore durante l'aggiornamento." }
  }

  revalidatePath("/(platform)/profile")
  return { success: true, message: "Profilo aggiornato con successo!" }
}

export async function updateAvatar(formData: FormData) {
  const supabase = createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, message: "Utente non autenticato." }
  }

  const avatarFile = formData.get("avatar") as File

  if (!avatarFile || avatarFile.size === 0) {
    return { success: false, message: "Nessun file selezionato." }
  }

  const fileExt = avatarFile.name.split(".").pop()
  const filePath = `${user.id}/${new Date().getTime()}.${fileExt}`

  const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, avatarFile)

  if (uploadError) {
    console.error("Errore nel caricamento dell'avatar:", uploadError)
    return { success: false, message: "Impossibile caricare l'immagine." }
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(filePath)

  const { error: dbError } = await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", user.id)

  if (dbError) {
    console.error("Errore nell'aggiornamento del DB per l'avatar:", dbError)
    return { success: false, message: "Impossibile salvare il nuovo avatar." }
  }

  revalidatePath("/(platform)/profile")
  return { success: true, message: "Avatar aggiornato!", newAvatarUrl: publicUrl }
}
