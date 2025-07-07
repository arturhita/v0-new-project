"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

type UserForAdmin = {
  id: string
  full_name: string | null
  email: string | null
  joined_at: string
  status: string | null
}

export async function getAllUsersForAdmin(): Promise<UserForAdmin[]> {
  const supabase = createClient()
  const { data, error } = await supabase.from("users_view").select("*").order("joined_at", { ascending: false })

  if (error) {
    console.error("Error fetching users for admin:", error)
    throw new Error("Impossibile caricare la lista degli utenti.")
  }
  return data
}

export async function toggleUserStatus(userId: string, currentStatus: string) {
  const supabase = createClient()
  const newStatus = currentStatus === "active" ? "suspended" : "active"

  const { error } = await supabase.from("profiles").update({ status: newStatus }).eq("id", userId)

  if (error) {
    console.error("Error toggling user status:", error)
    return { success: false, message: "Errore durante l'aggiornamento dello stato." }
  }

  revalidatePath("/admin/users")
  return { success: true, message: `Stato utente aggiornato a ${newStatus}.` }
}

export async function updateUserProfile(userId: string, data: { full_name?: string; stage_name?: string }) {
  const supabase = createClient()
  const { error } = await supabase.from("profiles").update(data).eq("id", userId)

  if (error) {
    console.error("Error updating user profile:", error)
    return { success: false, message: "Errore durante l'aggiornamento del profilo." }
  }

  revalidatePath("/profile")
  return { success: true, message: "Profilo aggiornato con successo." }
}
