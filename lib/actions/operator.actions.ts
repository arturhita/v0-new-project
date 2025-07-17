"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { unstable_noStore as noStore } from "next/cache"
import { revalidatePath } from "next/cache"

// NOTA: Assumiamo che ci siano altre funzioni in questo file.
// Aggiungiamo o sostituiamo solo getOperatorPublicProfile e updateOperatorProfile.

export async function getOperatorPublicProfile(username: string) {
  noStore()
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase.rpc("get_operator_public_profile", {
    in_username: username, // Usa il nome del parametro corretto
  })

  if (error) {
    console.error("Error fetching operator public profile:", error)
    return null
  }

  return data
}

export async function updateOperatorProfile(
  userId: string,
  profileData: {
    full_name?: string
    bio?: string
    specialization?: string[]
    tags?: string[]
  },
) {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.from("profiles").update(profileData).eq("id", userId).select().single()

  if (error) {
    console.error("Error updating operator profile:", error)
    return { error: "Impossibile aggiornare il profilo." }
  }

  // Revalida il percorso del profilo pubblico per mostrare i dati aggiornati
  if (data.username) {
    revalidatePath(`/operator/${data.username}`)
  }
  revalidatePath("/(platform)/dashboard/operator/profile")

  return { data }
}

export async function updateOperatorAvailability(userId: string, availability: any) {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.from("profiles").update({ availability }).eq("id", userId).select().single()

  if (error) {
    console.error("Error updating availability:", error)
    return { error: "Impossibile aggiornare la disponibilità." }
  }

  if (data.username) {
    revalidatePath(`/operator/${data.username}`)
  }
  revalidatePath("/(platform)/dashboard/operator/availability")

  return { data }
}
