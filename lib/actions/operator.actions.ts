"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import type { Profile } from "@/types/user.types"

// Schema for profile validation
const ProfileSchema = z.object({
  nickname: z.string().min(3, "Il nome d'arte deve essere di almeno 3 caratteri."),
  bio: z.string().min(10, "La biografia deve essere di almeno 10 caratteri.").optional().or(z.literal("")),
  specializations: z.string().optional(),
  phone_number: z.string().optional().or(z.literal("")),
})

// Action to get the current operator's profile
export async function getOperatorProfile(): Promise<Profile | null> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (error) {
    console.error("Error fetching operator profile:", error)
    return null
  }

  return profile
}

// Action to update the operator's profile
export async function updateOperatorProfile(formData: FormData) {
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
    return { success: false, message: "Dati non validi.", errors: validation.error.flatten().fieldErrors }
  }

  const { nickname, bio, phone_number } = validation.data
  const specializationsArray = validation.data.specializations
    ? validation.data.specializations.split(",").map((s) => s.trim())
    : []

  const profileDataToUpdate: Partial<Profile> = {
    nickname,
    bio,
    phone_number,
    specializations: specializationsArray,
    updated_at: new Date().toISOString(),
    // After any update, the profile must be re-approved by an admin
    status: "pending",
  }

  // Handle avatar upload
  const avatarFile = formData.get("avatar") as File | null
  if (avatarFile && avatarFile.size > 0) {
    const fileExt = avatarFile.name.split(".").pop()
    const fileName = `${user.id}-${Math.random()}.${fileExt}`
    const filePath = `avatars/${fileName}`

    const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, avatarFile, { upsert: true }) // Use upsert to overwrite if needed

    if (uploadError) {
      console.error("Error uploading avatar:", uploadError)
      return { success: false, message: "Errore durante il caricamento dell'avatar." }
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(filePath)
    profileDataToUpdate.avatar_url = publicUrl
  }

  // Update the profile in the database
  const { error: updateError } = await supabase.from("profiles").update(profileDataToUpdate).eq("id", user.id)

  if (updateError) {
    console.error("Error updating profile:", updateError)
    return { success: false, message: "Errore durante l'aggiornamento del profilo." }
  }

  revalidatePath("/(platform)/profile/operator")
  revalidatePath("/(platform)/esperti")
  revalidatePath("/admin/operator-approvals")

  return { success: true, message: "Profilo aggiornato! La tua richiesta è in attesa di approvazione." }
}

// Action to get all APPROVED operators for the public page
export async function getApprovedOperators(): Promise<Profile[]> {
  const supabase = createClient()
  const { data, error } = await supabase.from("profiles").select("*").eq("role", "operator").eq("status", "approved")

  if (error) {
    console.error("Error fetching approved operators:", error.message)
    return []
  }

  return data || []
}
