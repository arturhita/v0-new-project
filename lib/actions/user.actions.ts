"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateUserProfile(prevState: any, formData: FormData) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, message: "Utente non autenticato." }
  }

  const fullName = formData.get("full_name") as string

  if (!fullName || fullName.trim().length < 2) {
    return { success: false, message: "Il nome completo è obbligatorio." }
  }

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName, updated_at: new Date().toISOString() })
    .eq("id", user.id)

  if (error) {
    console.error("Error updating user profile:", error)
    return { success: false, message: "Errore durante l'aggiornamento del profilo." }
  }

  revalidatePath("/(platform)/profile")
  return { success: true, message: "Profilo aggiornato con successo!" }
}
