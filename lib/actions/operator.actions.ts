"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import type { Profile } from "@/types/user.types"

const ProfileSchema = z.object({
  nickname: z.string().min(3, "Il nome d'arte deve essere di almeno 3 caratteri."),
  bio: z.string().min(10, "La biografia deve essere di almeno 10 caratteri.").optional().or(z.literal("")),
  specializations: z.string().optional(),
  phone_number: z.string().optional().or(z.literal("")),
})

export async function updateOperatorProfile(prevState: any, formData: FormData) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, message: "Utente non autenticato." }
  }

  const rawData = {
    nickname: formData.get("nickname"),
    bio: formData.get("bio"),
    phone_number: formData.get("phone_number"),
    specializations: formData.get("specializations"),
  }

  const validation = ProfileSchema.safeParse(rawData)

  if (!validation.success) {
    return { success: false, message: validation.error.errors[0].message }
  }

  const { nickname, bio, phone_number } = validation.data
  const specializationsArray = validation.data.specializations
    ? validation.data.specializations
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : []

  const profileDataToUpdate: Partial<Profile> = {
    nickname,
    bio,
    phone_number,
    specializations: specializationsArray,
    updated_at: new Date().toISOString(),
    status: "pending", // Ogni modifica richiede una nuova approvazione
  }

  const avatarFile = formData.get("avatar") as File | null
  if (avatarFile && avatarFile.size > 0) {
    const fileExt = avatarFile.name.split(".").pop()
    const filePath = `${user.id}/avatar.${fileExt}`

    const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, avatarFile, { upsert: true })

    if (uploadError) {
      console.error("Error uploading avatar:", uploadError)
      return { success: false, message: "Errore durante il caricamento dell'avatar." }
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(filePath)
    profileDataToUpdate.avatar_url = `${publicUrl}?t=${new Date().getTime()}`
  }

  const { error: updateError } = await supabase.from("profiles").update(profileDataToUpdate).eq("id", user.id)

  if (updateError) {
    console.error("Error updating profile:", updateError)
    return { success: false, message: "Errore durante l'aggiornamento del profilo." }
  }

  revalidatePath("/(platform)/dashboard/operator/profile")
  revalidatePath("/admin/operator-approvals")

  return { success: true, message: "Profilo aggiornato! In attesa di approvazione." }
}
