"use server"

import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase/admin"

export async function getUsers() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("detailed_users")
    .select("*")
    .order("user_created_at", { ascending: false })

  if (error) {
    console.error("Error fetching users:", error)
    return { error: "Impossibile recuperare gli utenti." }
  }
  return { data }
}

export async function updateUserRole(userId: string, newRole: "admin" | "client" | "operator") {
  const supabase = createAdminClient()
  const { error } = await supabase.from("profiles").update({ role: newRole }).eq("id", userId)

  if (error) {
    console.error("Error updating user role:", error)
    return { success: false, message: "Errore durante l'aggiornamento del ruolo." }
  }

  revalidatePath("/admin/users")
  return { success: true, message: "Ruolo utente aggiornato con successo." }
}
